# Docker Host Installation And Recovery Boundary

Date: 2026-09-17. Owner approval: 2026-09-16.
Status: all-users installation, backup restoration, two normal restart/data checks and subsequent
Windows cold-start acceptance PASS. Backup relocation remains optional and unapproved.

## Decision

The owner explicitly approved evaluating and executing a data-preserving all-users Docker Desktop
installation after per-user 4.90 and 4.91 failed through the ordinary desktop entry point. Keep WSL2,
disable the unused Windows-container integration, and do not add users to privileged groups or
enable automatic service startup without a demonstrated need. Windows administrator approval is
handled by the owner, not automated through a security dialog.

The [recovery evidence](../technical/docker-desktop-recovery.md) records that the earlier Docker
data/settings and per-user registration were visible inside Codex's MSIX view but not the ordinary
desktop view. New durable runtime data and backups must live outside that package cache. Install
through the normal Windows desktop and verify the resulting host-visible HKLM registration.

## Incident And Recovery

The documented `uninstall -keep-data` operation unexpectedly lost its preservation flag when the
installed 4.91 uninstaller relaunched itself. It removed active data files and the WSL registration.
This contradicted the intended preservation boundary and was disclosed; never rewrite it as an
uneventful no-delete migration. Two prior cold backups exist, with the latest full backup outside
AppData. The latest backup was hash-verified before the operation.

Recover into the previously absent `C:\Users\admin\DockerDesktopData`, not over any existing disk.
Reverify backup and copied-file hashes, register the copied system disk without unregistering another
distribution, and retain both backup generations. Restoring disk bytes is not proof of database
integrity: compare all seven original container identities, two volumes, retained database snapshots
and the 43-product/604-fact immutable baseline after startup. Test the normal shortcut and at least
two normal stop/start cycles without IPC-directory surgery. Record a Windows reboot separately.

## Consequences And Rollback

The all-users installation has a broader host-access surface and needs administrator permission for
installation/updates. It is chosen for this specific broken host registration, not a general claim
that per-user Docker installations are defective. No Windows security policy is weakened.

If installation or verification fails, stop the new engine normally and preserve the current disks,
reports and independent backups. Do not reset Docker, prune resources, uninstall again, overwrite a
backup or repeat a database archive/switch. Review the exact failed stage before a further change.

This decision does not authorize the proposed third M3 database switch, hosted writes, CI dispatch,
product publication or deployment. It does not supersede the M3 database-preservation decisions.

## Completion Evidence

On September 17 at 04:14:16 UTC, the cold-start report passed after an independently verified
04:08:50 UTC Windows boot. The ordinary desktop shortcut and fresh CLI lookup work; all retained
container/database comparisons passed without IPC edits. C-drive free space is approximately 12 GB
after startup, so the earlier 2 GB capacity blocker is no longer current. No backup relocation was
performed. The detailed report paths and incident history remain in the linked recovery record.
