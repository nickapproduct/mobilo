Fix finding $FINDING in the Mobilo app (`$APPRODUCT_APP`) using Approduct.

Work in this order and do not skip the middle:

1. `get_finding` — read it in full, including the evidence and the frames. The frames are real
   screenshots from a walk on a device; read them with the `approduct://` links so you are looking at
   what actually happened rather than at my description of it.
2. `search_reference_screens` — find how other apps handle the same moment. There are 32,402 described
   reference screens; the finding names one app, but look for yourself and pick what is relevant.
3. Change the code. Keep the diff small and in the style of the file you are editing. Do not fix
   anything you were not asked about, however tempting.
4. Explain the change in the commit message in terms of what a person using the app will now see.

Do not run the app, do not install anything, and do not touch files outside `src/`.
