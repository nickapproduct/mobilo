# What is wrong with this app, and on purpose

Read this *after* watching the demo. The point is that the agent finds these from a crawl and its
screenshots; knowing them in advance is a different exercise.

Each fault is a real one, taken from findings on real apps in the workspace, and each pairs with
reference screens that already exist in the library — so "what do others do" has a good answer.

| # | Where | What is wrong | Reference to cite |
| --- | --- | --- | --- |
| 1 | `WelcomeScreen.tsx` | The notification permission is requested in a `useEffect` on first launch, before the person has done anything or been told why. One tap on "Don't allow" and it is gone for good. | Apple Store and Spotify for Creators both ask *after* the account exists, listing what the notifications are for and offering "Not now". GetYourGuide handles the already-refused case. |
| 2 | `HomeScreen.tsx` | The two controls in the top bar are glyphs in a `Pressable` with no `accessibilityLabel` and no `accessibilityRole`. TalkBack announces them as nothing at all. | A real Silknet finding, same shape. |
| 3 | `TopUpScreen.tsx` | `topUp` returns `{ok: false, declineCode}` and the screen ignores it: on a decline the spinner stops and nothing else happens. The person is left on the form with no idea whether they have been charged. | Warby Parker, Ticketmaster and Glovo all name the reason and offer the next step — "Update card info", "Try again", "Change payment method". |
| 4 | `SignInScreen.tsx`, `OtpScreen.tsx` | Both show the word `Error` and nothing else. It does not say what went wrong or what to do. | Same three references as #3. |
| 5 | `WelcomeScreen.tsx` | Nothing can be seen without signing in — not even the tariffs, which are public information and the reason somebody downloaded the app. | Beeline's "become a subscriber" hub puts porting, buying a SIM and comparing tariffs in front of the login. |

## Keeping it demonstrable

The faults are not commented in the source. An agent that can grep for `FIXME` has not found anything;
it has read a note somebody left it. Put the faults back with `git revert` on the fix commit, or keep a
`broken` branch and reset to it between runs.
