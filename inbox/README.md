# inbox

Drop photos here — straight off the phone is fine (HEIC, JPEG, PNG, screenshots).

Then run `/buildlog log <build>` (or `/buildlog new <build>`). Each photo gets
resized to 1600px, turned upright, and **stripped of all metadata, GPS
included**, then moved into `builds/<slug>/media/`. The originals go to
`inbox/done/`; clear that out whenever you like.

Nothing in here except this file is committed.
