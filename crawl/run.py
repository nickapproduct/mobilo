"""Drive Mobilo once and write the bundle. `python run.py` with the phone attached."""

from __future__ import annotations

import json
import subprocess
import time
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from walk import ACTIVITY, HERE, PKG, Walk, adb

RUN_ID = f"run_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"


def fresh_start() -> None:
    """A walk that begins where the last one ended is a walk of somebody else's app.

    Clearing the data also puts the notification permission back, which is the whole of finding 1.
    """
    subprocess.run(["adb", "shell", "pm", "clear", PKG], capture_output=True)
    subprocess.run(["adb", "shell", "am", "force-stop", PKG], capture_output=True)
    time.sleep(1)
    adb("shell", "am", "start", "-n", ACTIVITY)
    time.sleep(5)


def main() -> None:
    out = HERE / RUN_ID
    walk = Walk(RUN_ID, out)
    print(f"walking {PKG} into {out.name}")
    fresh_start()

    # 1. First launch. The OS permission dialog is in front of the welcome screen, before the person
    #    has done anything at all — which is the finding, and it has to be the frame that proves it.
    walk.capture("welcome_permission", "the permission ask, over the first screen", expect="notifications")
    walk.tap_text("Allow")
    walk.move("welcome", "TAP", "Allow", "what the app opens on", expect="Your mobile")

    # 2. There is nothing to look at without an account, so both doors lead to the same place.
    walk.tap_text("Sign in")
    walk.move("sign_in", "TAP", "Sign in", "phone number", expect="Your number")

    walk.type_text("555010203")
    walk.tap_text("Send the code")
    walk.move("otp", "TAP", "Send the code", "the one-time code", expect="Enter the code")

    walk.type_text("0000")
    walk.tap_text("Continue")
    walk.move("home", "TAP", "Continue", "balance and tariff", expect="Balance")

    # 3. Top up with a card the issuer refuses. The screen does not say so.
    walk.tap_text("Top up")
    walk.move("top_up", "TAP", "Top up", "choose an amount", expect="The money reaches")

    walk.tap_text("Card number")
    walk.type_text("4111111111111100")
    walk.capture("top_up_filled", "a card that will be declined", expect="4111")
    walk.tap_text("Pay")
    time.sleep(3)
    walk.move("top_up_declined", "TAP", "Pay 10", "after the decline: nothing has changed", expect="The money reaches")

    walk.back()
    walk.move("home_after", "BACK", "back", "the balance is the same and nothing said why", expect="Balance")

    walk.tap_text("Change tariff")
    walk.move("tariffs", "TAP", "Change tariff", "what else is available", expect="Tariffs")

    # The icon, so the app is not one more unbranded row in the list. The launcher asset is the one
    # thing in the bundle that does not come off the screen, because a screenshot of an icon is not an
    # icon.
    icon_rel = ""
    for candidate in (
        Path("../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp"),
        Path("../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"),
        Path("../android/app/src/main/res/mipmap-xhdpi/ic_launcher.webp"),
    ):
        source = (HERE / candidate).resolve()
        if source.is_file():
            icon_rel = f"artifacts/{source.name}"
            (out / icon_rel).write_bytes(source.read_bytes())
            break

    graph: dict[str, Any] = {
        "schema_version": 1,
        "run_id": RUN_ID,
        "platform": "android",
        "app_pkg": PKG,
        "app_context": "Mobilo is a telecom self-care app: balance, tariff and top-ups.",
        "run": {
            "app_label": "Mobilo",
            "app_version_name": "1.0.0",
            "model_id": "hand-driven walk on a Galaxy S23",
            "app_source_url": "",
            "app_icon": icon_rel,
        },
        "device": {"model": "SM-S9180", "os": "Android 13", "real_device": True},
        "launches": [{"launch_id": walk.launch_id, "started_at": walk.started_at}],
        "nodes": [
            {
                "state_id": n.state_id,
                "activity": n.activity,
                "visits": [
                    {
                        "visit_id": v.visit_id,
                        "step_id": v.step_id,
                        "screenshot": v.screenshot,
                        "xml": v.xml,
                        "launch_id": v.launch_id,
                        "timestamp": v.timestamp,
                    }
                    for v in n.visits
                ],
            }
            for n in walk.nodes
        ],
        "edges": walk.edges,
        "issues": [],
    }
    (out / "graph_export.json").write_text(json.dumps(graph, indent=2))

    report_dir = out / f"report_{RUN_ID.split('_')[-1]}"
    report_dir.mkdir(exist_ok=True)
    from findings import report_for

    (report_dir / "findings.json").write_text(json.dumps(report_for(walk), indent=2))
    print(f"\nwrote {out}")
    print(f"  {len(walk.nodes)} screens, {len(walk.edges)} taps, {walk.step} frames")


if __name__ == "__main__":
    main()
