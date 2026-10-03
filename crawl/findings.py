"""What the walk found, in the shape `report_<id>/findings.json` has to be.

Five findings, one per planted fault. Each names the state it is on so the importer can anchor it to a
screen, and each carries the frame that proves it — the real one, off the phone, captured a moment ago.

`why_this_matters` lines may carry a markdown link; the importer pulls it out as evidence with a url.
The references cited here are apps that are actually in the library, so "what do others do" has an
answer somebody can open rather than a claim.
"""

from __future__ import annotations

from typing import Any

from walk import Walk


def _frame(walk: Walk, state: str, hint: str, offending: bool = True) -> dict[str, Any]:
    """The first frame captured at a state, as a step in a finding's flow."""
    node = next((n for n in walk.nodes if n.state_id == state), None)
    visit = node.visits[0] if node and node.visits else None
    return {
        "state_id": state,
        "screenshot": visit.screenshot if visit else "",
        "hint": hint,
        "offending": offending,
    }


def report_for(walk: Walk) -> dict[str, Any]:
    findings: list[dict[str, Any]] = [
        {
            "number": 1,
            "category": "ux",
            "severity": "high",
            "title": "The notification permission is asked for before anything has happened",
            "kind_title": "Cold permission request",
            "problem": (
                "The system notification dialog appears over the welcome screen on first launch, before "
                "the person has signed in, seen a balance or been told what the notifications would be "
                "for. There is no screen in front of it explaining the ask."
            ),
            "why_this_matters": [
                "A refusal here is close to permanent: Android will not show the dialog again, and the "
                "app has spent its one chance before giving the person a reason to say yes.",
                "Top-up confirmations and low-balance warnings are the notifications a self-care app "
                "exists to send, and they are the ones lost.",
            ],
            "recommendation_title": "Ask after the account exists, and say what for",
            "recommendation_text": (
                "Move the request out of the welcome screen's effect. Show it after the first sign-in, "
                "behind a screen that lists what will be sent — top-up confirmations, low balance, "
                "roaming charges — with a 'Not now' that is a real choice."
            ),
            "badges": ["Permissions", "Onboarding"],
            "user_feelings": ["Interrupted", "Suspicious"],
            "competitor": {
                "name": "Apple Store",
                "flow_name": "Onboarding",
                "why_better": "lists the three notification types and offers 'Not now' before the OS dialog",
                "screens": [],
            },
            "flow": [_frame(walk, "welcome_permission", "the dialog, over a screen nobody has used yet")],
        },
        {
            "number": 2,
            "category": "bugs",
            "severity": "critical",
            "title": "A declined top-up says nothing at all",
            "kind_title": "Silent failure",
            "problem": (
                "Paying with a card the issuer refuses stops the spinner and leaves the form exactly as "
                "it was. No message, no error, no change to the balance. The person cannot tell whether "
                "they have been charged, and the obvious next move is to press Pay again."
            ),
            "why_this_matters": [
                "The server returns the reason — insufficient funds — and the screen throws it away.",
                "This is the single most common complaint about this app in the stores.",
            ],
            "recommendation_title": "Say what happened and what to do next",
            "recommendation_text": (
                "Handle the failed result: name the reason the issuer gave and offer the next step — "
                "change the card, try again, or go back. Never leave a payment screen in the state it "
                "was in before the attempt."
            ),
            "badges": ["Payments", "Money"],
            "user_feelings": ["Confused", "Does not trust it"],
            "competitor": {
                "name": "Glovo",
                "flow_name": "Scheduling a courier service",
                "why_better": "names the reason and offers 'Change payment method' or 'Back to checkout'",
                "screens": [],
            },
            "flow": [
                _frame(walk, "top_up_filled", "the card entered, before paying", offending=False),
                _frame(walk, "top_up_declined", "after the decline: the form is unchanged"),
                _frame(walk, "home_after", "the balance is the same and nothing said why", offending=False),
            ],
        },
        {
            "number": 3,
            "category": "ux",
            "severity": "medium",
            "title": "The controls on the home screen announce nothing to a screen reader",
            "kind_title": "Unlabelled controls",
            "problem": (
                "The two controls at the top of the home screen are glyphs with no label and no role. A "
                "screen reader reaches them and has nothing to say, so somebody using TalkBack cannot "
                "tell what either of them does."
            ),
            "why_this_matters": [
                "A self-care app is often the only way to check a balance or a tariff, which makes it "
                "exactly the kind of app that has to be usable without sight.",
                "Accessibility is a procurement requirement for operators in most markets.",
            ],
            "recommendation_title": "Give every control a label and a role",
            "recommendation_text": (
                "Add an accessibilityLabel saying what the control does — 'Refresh balance', 'Menu' — "
                "and accessibilityRole=\"button\" so it is announced as something that can be pressed."
            ),
            "badges": ["Accessibility"],
            "user_feelings": ["Excluded"],
            "flow": [_frame(walk, "home", "two controls, neither of which announces itself")],
        },
        {
            "number": 4,
            "category": "ux",
            "severity": "medium",
            "title": "Sign-in failures say only 'Error'",
            "kind_title": "Unhelpful error",
            "problem": (
                "A number that is too short, or a wrong code, puts the word 'Error' under the field. It "
                "does not say what was wrong with what was typed, or what to do about it."
            ),
            "why_this_matters": [
                "This is the first screen of the app, so the first thing it teaches is that it will not "
                "explain itself.",
                "A person who cannot get past the sign-in does not file a bug, they uninstall.",
            ],
            "recommendation_title": "Say which thing was wrong",
            "recommendation_text": (
                "Replace the single word with the reason: the number is too short, the code has expired, "
                "the code does not match. Offer the way forward — resend the code — next to it."
            ),
            "badges": ["Onboarding", "Errors"],
            "user_feelings": ["Stuck"],
            "flow": [_frame(walk, "sign_in", "the field, and the one word it answers with")],
        },
        {
            "number": 5,
            "category": "sales",
            "severity": "high",
            "title": "Nothing can be seen without an account, not even the tariffs",
            "kind_title": "Forced registration",
            "problem": (
                "Both buttons on the welcome screen lead to the same sign-in. Tariffs and prices — public "
                "information, and the reason somebody who is not yet a subscriber downloads the app — are "
                "behind a phone number and a one-time code."
            ),
            "why_this_matters": [
                "Somebody comparing operators cannot compare anything, so the app is of no use at the "
                "moment they are deciding.",
                "A 'become a subscriber' button that only leads to a login for existing subscribers is a "
                "dead end for the one visitor worth the most.",
            ],
            "recommendation_title": "Put the tariffs in front of the login",
            "recommendation_text": (
                "Let the welcome screen reach the tariff list without an account, and keep the sign-in "
                "for what actually needs one. Give 'Become a subscriber' somewhere of its own to go."
            ),
            "badges": ["Acquisition", "Money"],
            "user_feelings": ["Blocked"],
            "competitor": {
                "name": "Beeline",
                "flow_name": "Onboarding hub — subscribe & compare tariff & log in",
                "why_better": "puts porting a number, buying a SIM and comparing tariffs in front of the login",
                "screens": [],
            },
            "flow": [_frame(walk, "welcome", "two buttons, one destination")],
        },
    ]

    screens = {
        "welcome_permission": {"name": "Welcome — permission ask", "type": "permission", "area": "Onboarding"},
        "welcome": {"name": "Welcome", "type": "onboarding", "area": "Onboarding"},
        "sign_in": {"name": "Sign in", "type": "signup", "area": "Onboarding"},
        "otp": {"name": "One-time code", "type": "signup", "area": "Onboarding"},
        "home": {"name": "Home", "type": "home", "area": "Account"},
        "top_up": {"name": "Top up", "type": "checkout", "area": "Payments"},
        "top_up_filled": {"name": "Top up — card entered", "type": "checkout", "area": "Payments"},
        "top_up_declined": {"name": "Top up — after the decline", "type": "error", "area": "Payments"},
        "home_after": {"name": "Home — after the failed top-up", "type": "home", "area": "Account"},
        "tariffs": {"name": "Tariffs", "type": "list", "area": "Account"},
    }

    flows = [
        {
            "flow_id": "flow_onboarding",
            "name": "First launch to signed in",
            "category": "onboarding_auth",
            "purpose": "What a new person meets before they can use anything.",
            "state_ids": ["welcome_permission", "welcome", "sign_in", "otp", "home"],
            "collects_data": True,
            "finding_numbers": [1, 4, 5],
            "occurrences": [{"visit_ids": [], "captions": []}],
        },
        {
            "flow_id": "flow_top_up",
            "name": "Topping up with a card",
            "category": "transaction",
            "purpose": "The thing the app exists to do, and what happens when it fails.",
            "state_ids": ["home", "top_up", "top_up_filled", "top_up_declined", "home_after"],
            "collects_data": True,
            "finding_numbers": [2, 3],
            "occurrences": [{"visit_ids": [], "captions": []}],
        },
    ]

    return {"findings": findings, "screens": screens, "flows": flows}
