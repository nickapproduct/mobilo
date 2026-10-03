"""Walk Mobilo on the phone and write a run bundle Approduct can import.

This is a hand-driven stand-in for the crawler: same output, one app, a fixed path. The point is the
bundle, which has to be exactly what `importer/run_export.py` reads — `graph_export.json` for the walk
and `report_<id>/findings.json` for what was found — because the loop being demonstrated ends with
`python -m approduct_server import`, and a bundle that needs translating on the way in is not the
format.

Every screenshot here is a real frame off a real device. That is the part worth protecting: a finding
whose evidence was drawn rather than captured proves nothing.
"""

from __future__ import annotations

import json
import re
import subprocess
import time
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

PKG = "ai.approduct.mobilo"
ACTIVITY = f"{PKG}/.MainActivity"
HERE = Path(__file__).resolve().parent


def adb(*args: str, binary: bool = False) -> Any:
    out = subprocess.run(["adb", *args], capture_output=True, check=True)
    return out.stdout if binary else out.stdout.decode("utf-8", "replace")


def iso() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


@dataclass
class Visit:
    visit_id: str
    step_id: int
    screenshot: str
    xml: str
    launch_id: str
    # Epoch seconds, not ISO. The importer reads this and `launches[].started_at` as floats to work
    # out how long the run took, and an ISO string there fails the import outright.
    timestamp: float


@dataclass
class Node:
    state_id: str
    activity: str
    visits: list[Visit] = field(default_factory=list)


class Walk:
    """One pass through the app, collecting a frame and a hierarchy at every stop."""

    def __init__(self, run_id: str, out: Path) -> None:
        self.started_at = time.time()
        self.run_id = run_id
        self.out = out
        self.shots = out / "artifacts" / "screenshots"
        self.xmls = out / "artifacts" / "xml"
        self.shots.mkdir(parents=True, exist_ok=True)
        self.xmls.mkdir(parents=True, exist_ok=True)
        self.launch_id = f"launch_{run_id}"
        self.nodes: list[Node] = []
        self.edges: list[dict[str, Any]] = []
        self.step = 0
        self.last_state: str | None = None

    def on_screen(self) -> list[str]:
        adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
        dump = adb("shell", "cat", "/sdcard/ui.xml")
        return [m.group(1) for m in re.finditer(r'text="([^"]+)"', dump)]

    def capture(self, state: str, note: str = "", expect: str = "") -> str:
        """A frame and the hierarchy behind it, named for the state they belong to.

        `expect` is a word that has to be on screen for this to be that state. Without it a walk that
        did not go where it meant to carries on and files frames under the wrong names — which is how a
        finding ends up with evidence of something else, and that is worse than no finding at all.
        """
        self.step += 1
        time.sleep(1.4)  # let the animation finish, or the frame is of the transition
        if expect:
            showing = self.on_screen()
            if not any(expect.lower() in s.lower() for s in showing):
                raise AssertionError(
                    f"expected to be on {state!r} (looking for {expect!r}) but the screen shows {showing[:10]}"
                )
        visit_id = f"v{self.step:02d}"
        shot = f"{state}_{visit_id}.png"
        (self.shots / shot).write_bytes(adb("exec-out", "screencap", "-p", binary=True))
        adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
        xml = f"{state}_{visit_id}.xml"
        (self.xmls / xml).write_text(adb("shell", "cat", "/sdcard/ui.xml"))
        node = next((n for n in self.nodes if n.state_id == state), None)
        if node is None:
            node = Node(state_id=state, activity=f"{PKG}.MainActivity")
            self.nodes.append(node)
        node.visits.append(
            Visit(visit_id=visit_id, step_id=self.step, screenshot=f"artifacts/screenshots/{shot}",
                  xml=f"artifacts/xml/{xml}", launch_id=self.launch_id, timestamp=time.time())
        )
        print(f"  {self.step:2}. {state}{'  — ' + note if note else ''}")
        self.last_state = state
        return visit_id

    def move(self, to_state: str, action: str, label: str, note: str = "", expect: str = "") -> None:
        """Record the tap that got us here, then capture where it landed."""
        src = self.last_state
        began = time.time()
        visit = self.capture(to_state, note, expect)
        if src:
            self.edges.append({
                "edge_id": f"e{len(self.edges) + 1}",
                "src_state_id": src,
                "dst_state_id": to_state,
                "action": {"type": action, "text": label, "target": {"text": label, "name": label}},
                "traversals": [{
                    "target_label": label,
                    "duration_ms": int((time.time() - began) * 1000),
                    "visit_id": visit,
                }],
            })

    def tap_text(self, text: str) -> bool:
        """Tap whatever carries this text, read off the live hierarchy rather than guessed.

        An exact match wins before a partial one, and it has to. The permission dialog puts "Allow" on
        the button, inside "Don't allow" on the button beside it, and inside "Allow Mobilo to send you
        notifications?" on the title above both — so the first substring hit in document order is the
        title, and tapping a title does nothing at all. The walk would then carry on and quietly file a
        bundle in which the dialog never closed.
        """
        adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
        dump = adb("shell", "cat", "/sdcard/ui.xml")
        found = [
            (m.group(1), (int(m.group(2)) + int(m.group(4))) // 2, (int(m.group(3)) + int(m.group(5))) // 2)
            for m in re.finditer(r'(?:text|content-desc)="([^"]*)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', dump)
            if m.group(1).strip()
        ]
        want = text.strip().lower()
        for label, x, y in found:
            if label.strip().lower() == want:
                adb("shell", "input", "tap", str(x), str(y))
                return True
        for label, x, y in found:
            if want in label.lower():
                print(f"     (tapped {label!r} for {text!r})")
                adb("shell", "input", "tap", str(x), str(y))
                return True
        print(f"     ! could not find {text!r}; on screen: {[l for l, _, _ in found][:8]}")
        return False

    def type_text(self, value: str) -> None:
        adb("shell", "input", "text", value.replace(" ", "%s"))

    def back(self) -> None:
        """Leave the screen, keyboard or no keyboard.

        A soft keyboard eats the first back press, so one press after typing into a field dismisses the
        keyboard and goes nowhere. That is how a walk stays on a screen it believes it has left.
        """
        self.hide_keyboard()
        adb("shell", "input", "keyevent", "4")
        time.sleep(1.2)

    def hide_keyboard(self) -> None:
        shown = "mInputShown=true" in adb("shell", "dumpsys", "input_method")
        if shown:
            adb("shell", "input", "keyevent", "4")
            time.sleep(0.6)
