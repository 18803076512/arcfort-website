# Docker Desktop Recovery Evidence

Reviewed: 2026-09-18. Scope: this Windows workstation and its retained local Console fixtures.
Status: September 17 recovery/startup/data checks and September 18 post-enable Windows reboot,
ordinary Docker startup and complete retained-data acceptance PASS. The owner-approved
VirtualMachinePlatform repair is verified; see the latest checkpoint for the exact evidence.

## Boundary

The owner requested a durable Docker repair. This authorizes local diagnosis and a non-destructive
repair, not another database archive/switch, WSL unregister, factory reset, volume/image pruning,
hosted work or deployment. On September 16, the owner explicitly approved evaluating and executing
a data-preserving all-users installation. This did not authorize data loss or WSL unregister.
The third M3 database switch was separately approved and completed on September 17; see the
[M3 runbook](../../docs/operations/console-m3-isolated-acceptance.md).

Preserve current `postgres`, both `arcfort_m3_failed_20260913` and
`arcfort_m3_failed_20260914`, the empty `arcfort_m3_qa_20260913_c` template and all other retained
databases. The target remains `desktop-linux`, the local `dockerDesktopLinuxEngine` pipe and
`supabase_db_arcfort-product-intelligence`. Never substitute a hosted target.
The later third switch additionally retains `arcfort_m3_failed_20260914_b`. After that switch,
the old Docker verifier's current-`postgres` comparison is historical and must not be replayed as
though the current database were unchanged. Use the new M3 retention report for the new baseline.

## Backup And Data Proof

With Docker fully stopped on September 15, both actual VHDX files and settings were copied to
`%LOCALAPPDATA%\DockerRepairBackup\20260915-4.89-to-4.90`. The destination is restricted to the
current user, SYSTEM and Administrators. Source/copy SHA-256 hashes matched, and source size and
modification time were unchanged during the copy. This is a cold backup, not a tested restore.
Do not overwrite current disks with it without a new rollback review.

| Backup file           | Bytes         | SHA-256                                                            |
| --------------------- | ------------- | ------------------------------------------------------------------ |
| `docker_data.vhdx`    | 7,813,988,352 | `2606209dbd522367dad492586a4231901459f2724f8b1bab2abe7dfbcdaebd79` |
| `main-ext4.vhdx`      | 100,663,296   | `c07aa5ba5de646d5de3a3982957ee1390a676dfab5440581de3ba77d3924a90b` |
| `settings-store.json` | 258           | `4a3885d6eaa1faf6c28b50308cee7eee31dccb767901933d33b0b57ae363a9b6` |

The private manifest also exists at `.tmp/docker-repair-backup-20260915.json`. No database contents,
credentials or raw Docker inspect environment are retained in this knowledge record.

The read-only `.tmp/verify-docker-repair-20260915.mjs` compares current table counts/hashes to
`.tmp/m3-retention-20260914.json`, both archives and the empty template to
`.tmp/m3-preservation-20260914.json`, and all 43 original product variants / 604 technical facts
to the complete immutable adoption baseline. It also checks the seven exact container identities,
mount destinations and two original named volumes. Each report is write-once.

- `.tmp/docker-repair-initial-20260915.json`: PASS, 2026-09-14 23:25:09 UTC.
- `.tmp/docker-repair-cold-start-20260915.json`: PASS on September 16 after a Windows reboot and
  another bounded recovery start. The filename names the investigation, not the check date.
- Current retained state: 46 variants, five synthetic users, four roles, one adoption, three draft
  heads, six verification events, 3,727 audit events and zero publication records.
- Current variant hash: `a6d9656463aca0d7b3b7b095035a70e7`.
- Current technical-fact hash: `4520ff1b2ef10ddb1c784122ea960358`.

These results prove data retention at those checkpoints, not stable Docker restart behavior or M3
acceptance. The cold-start report does not prove that the ordinary desktop shortcut works.

## Findings And Negative Controls

Windows 11 Pro build 26200.8875, WSL 2.7.12.0 and the existing WSL2 per-user Docker installation
were inspected. Initial Desktop version was 4.89.0.238018, Engine 29.7.2. Autostart was false and
was not changed. Before the all-users migration, no Windows feature, security policy, service
startup type or account permission was changed.

1. The backend repeatedly failed before starting the engine while renaming
   `%LOCALAPPDATA%\Docker\run\sailor-ingest.sock` to its `.stale` name. Windows returned
   `The file cannot be accessed by the system`. This is not proof of an ACL permission denial.
2. Official Desktop 4.90.0.238679 was installed in place with `install --user --quiet --backend=wsl-2`.
   Its installer SHA-256 was
   `2ecc54255702ffbf2e2779cb35ebecde535a0b31e4223171be2195dc318ebd3d`, and its Docker Inc signature
   was valid. Installation exited zero. It still failed on the old socket.
3. Retaining the two IPC directories intact allowed a single startup. Normal CLI stop then start
   reproduced the same failure without any data reset. Direct `Start-Process` also reproduced it.
   Upgrading plus clearing old IPC paths was therefore not a durable fix.
4. A two-directory NTFS compression experiment also reproduced the failure. It affected only empty
   replacement IPC directories, not VHDX files or system compression. The original compression
   inheritance was restored on September 15. Do not recommend decompression as a proven remedy.
5. Independent .NET AF_UNIX bind/connect/byte-exchange/dispose probes worked in compressed and
   uncompressed temporary directories; subsequent enumeration found no retained probe entries.
   This does not establish that Docker's own socket lifecycle is healthy.
6. A plain `Shell.Application.ShellExecute` call still launched below the command process and was
   not a valid Explorer-parent comparison. A desktop `FindWindowSW` / `Document.Application`
   launch did produce an Explorer-parented Docker process, but it stopped at a different error:
   `getting backend binary path: cannot find registry key "SOFTWARE\Docker Inc.\Docker Desktop"`.
   The official desktop shortcut reproduced this after a Windows reboot on September 16.
7. The per-user uninstall registration exists, while the named legacy key is absent in HKCU and
   HKLM. The official shortcut targets the installed root executable with no arguments or working
   directory. Explorer and approved command execution use the same real user. Selected directory
   environment variables match; inspected installation ACLs grant that user access. This does not
   justify creating a machine-install registry key for a per-user installation.
8. `Docker Desktop.exe --help` did not display help: it started the backend. Do not use that command
   as a read-only capability probe. The resulting engine was checked and normally stopped.

The two preserved IPC roots are `%LOCALAPPDATA%\Docker\run` and
`%LOCALAPPDATA%\docker-secrets-engine`. Their dated preservation suffixes are `pre-fix-20260915`,
`cli-restart-failed-20260915`, `uncompressed-test-20260915`, `compression-negative-20260915` and
`pre-explorer-20260915` and `pre-backend-shell-20260916`. Each operation checked absent Docker processes, absolute path boundaries,
non-reparse parent directories, exact observed filenames and zero-byte reparse-point entries before
renaming directories. Nothing inside them was deleted. These are forensic recoveries, not cleanup
steps to repeat automatically at every startup.

## September 16 Follow-Up

Docker Desktop 4.91.0.239619 was installed in per-user mode with exit zero. The downloaded
installer matched the official SHA-256
`ac405b09942701770d581b173747fc1024cf0e6047cbe60f13d1df85437311ac` and has a valid Docker Inc
signature. Before installation, the retained-data check passed again and Docker / `docker-desktop`
WSL were confirmed stopped. The ordinary desktop shortcut still failed at the missing registry key.
Launching its backend directly from Explorer also failed before engine/log initialization. Normal
stop timed out; only the two exact experiment-owned backend processes were stopped after confirming
the engine pipe was absent and WSL stopped. This was not a running database shutdown.

### Physical Path And Registry Discovery

`GetFinalPathNameByHandle` resolved the apparently ordinary Docker disks and settings into
`%LOCALAPPDATA%\Packages\OpenAI.Codex_2p2nqsd0c76g0\LocalCache\Local\Docker` and the corresponding
`LocalCache\Roaming\Docker`. The first backup also resolves inside that package cache.
The installed program binary itself was not redirected.

A read-only PowerShell probe launched by the actual Explorer desktop confirmed that the ordinary
`%LOCALAPPDATA%\Docker\wsl` disks did not exist there, the host settings were a different file, and
the per-user uninstall registry entry visible from Codex was absent from the ordinary desktop.
WSL's registered base path explicitly named the package cache. Evidence is retained in
`.tmp/docker-host-view-20260916.json`. Matching environment-variable text therefore did not imply
matching physical paths or registry views. This explains the launcher registration discrepancy;
the complete AF_UNIX failure mechanism is not independently proven.

### Second Independent Cold Backup

Before uninstalling, the actual physical disks, settings, CLI configuration and context were copied
to `C:\Users\admin\DockerRepairBackup\20260916-pre-all-users`, outside AppData virtualization.
All eight file hashes matched with Docker and WSL stopped. Access is limited to the current user,
SYSTEM and Administrators. Manifest: `.tmp/docker-pre-all-users-backup-20260916.json`.

- Data disk: 8,243,904,512 bytes, SHA-256
  `8e41fb8c63591f0da4ba37b566c77916cae9c0da87738729323d0a02793f61f6`.
- System disk: 100,663,296 bytes, SHA-256
  `795503e3ef47253a765be8f3c88e250a6e18fc8cb2de9033048774d93593ed78`.

### Unexpected Uninstall Data Removal

The official documented invocation `Docker Desktop Installer.exe uninstall -keep-data` was used
for the installed per-user 4.91 build. However, its subsequent temporary self-relaunch log records
only `uninstall --remove-self --relaunch-from-temp`; the child ran `InstallerCli.exe --user -k -u`
and explicitly logged deletion of `docker_data.vhdx` and settings. On September 17, inspection
confirmed the active disk and Docker WSL registration were gone. The original execution handle was
no longer available, so no captured exit code is claimed. This was an unexpected failure of the
intended preservation operation, not authorized cleanup. It was disclosed to the owner.
The uninstaller also logged deletion of stored credentials. Credential-store recovery was not
performed; a later registry pull may require the owner to sign into Docker Hub again. Local
container/database recovery does not prove preservation of a registry login session.

Do not repeat that bundled-uninstaller invocation or treat the documented flag as sufficient proof
of preservation on this build. Do not claim that no data files were deleted. The independently
verified cold copies remain the recovery source. No agent-issued WSL unregister command was used.

### September 17 Recovery And Runtime Acceptance

Every backup hash was reverified. Both disks were copied to the absent independent
`C:\Users\admin\DockerDesktopData` destination with matching SHA-256 hashes. Settings and CLI
configuration were restored; the copied system disk was registered with `wsl --import-in-place`.
The new WSL registration has a new GUID, not the previous registration identity. No existing disk or
distribution was overwritten. Both cold backup generations remain intact.

The signed official all-users installer ran outside the package through the ordinary desktop and
exited zero. Host-visible HKLM uninstall registration points to `C:\Program Files\Docker\Docker`,
version `4.91.0.239619`. `C:\ProgramData\DockerDesktop\install-settings.json` selects WSL2,
`noWindowsContainers: true` and `wslDefaultDataRoot: C:\Users\admin\DockerDesktopData`.
The privileged service is installed but stopped/manual; no privileged group grant was added.
Evidence: `.tmp/docker-all-users-recovery-20260917.json`, status PASS.

The installer-created desktop shortcut now works. Three write-once read-only reports pass:

- `.tmp/docker-repair-all-users-initial-20260917.json`, 2026-09-16 22:27:05 UTC.
- `.tmp/docker-repair-all-users-restart-1-20260917.json`, 2026-09-16 22:28:24 UTC.
- `.tmp/docker-repair-all-users-restart-2-20260917.json`, 2026-09-16 22:28:58 UTC.

Each verifies the same seven original container IDs/mounts, two named volumes, current database,
both historical archives, empty template, immutable 43 variants / 604 facts and zero publication
records. Six containers have healthy healthchecks; REST has no healthcheck and is running. Both
normal stop/start cycles used the ordinary desktop shortcut, with no socket surgery or data reset.
Windows UI inspection shows `Engine running` and the original Compose project. Engine/client are
29.8.0, Compose 5.5.1 and Buildx 0.37.0. No full M3 acceptance was rerun.

The system PATH contains the all-users CLI directory. The pre-reboot Codex process inherited a
stale PATH, so its checks used the exact installed executable. After the verified Windows reboot,
`Get-Command docker` resolves to `C:\Program Files\Docker\Docker\resources\bin\docker.exe`.
No fake executable or competing PATH entry was added.
Future Docker startup must use the ordinary desktop, not a backend process spawned inside a packaged
agent's virtualized environment.

At the initial acceptance checkpoint, Windows reboot verification was pending and C-drive free
space was about 2 GB. Owner approval was requested to move both complete cold backups to
`E:\DockerRepairBackup` with hash verification. No backup has been moved or deleted under that
unanswered request. The subsequent cold-start checkpoint below supersedes the low-space and reboot
blockers; backup relocation is now optional and still requires that answer.

The all-users cold-start verifier now requires an actual Windows `LastBootUpTime` later than both
the all-users installation completion and the second restart report. On September 17, the observed
boot was 2026-09-16 22:17:06 UTC, before those checkpoints. The negative control correctly refused
before Docker/SQL checks and did not create a cold-start PASS report. Evidence:
`.tmp/docker-cold-start-gate-negative-20260917.json`. This is a tested refusal, not cold-start success.

### Post-Migration Windows Reboot Acceptance

Windows subsequently booted at 2026-09-17 04:08:50 UTC, after both installation and the second normal
restart. Autostart remained false, so an absent engine before the desktop launch was expected, not
a failed startup. The installed ordinary desktop shortcut started the engine successfully without
IPC changes. `.tmp/docker-repair-all-users-cold-start-20260917.json` passed at 04:14:16 UTC, recording
the boot time and both prerequisite timestamps. All seven original container identities, two
volumes, current database, both archives, empty template, 43 original variants / 604 facts and zero
publication records matched again. The CLI path also resolves correctly in the fresh session.

C-drive free space was 13,556,572,160 bytes before startup and 11,948,105,728 bytes after acceptance.
This recovery was observed after the reboot; no agent cleanup or backup relocation produced it.
Both original backup data disks still exist at their recorded paths and sizes. The Docker repair
phase is complete within this verified scope. It does not guarantee behavior under every future
Windows/Docker update, prove registry-login restoration, or close any M3/15AK publication gate.

### Further Reboot After M3 Acceptance

Another actual Windows boot at 2026-09-17 08:41:31 UTC was observed after the third M3 local run.
With autostart still false, Docker was initially absent. The ordinary installed shortcut started
the engine without socket changes or data reset. `.tmp/m3-retention-20260917.json` passed at
10:38:33 UTC: all three archives/template and the 43 original variants / 604 facts remain intact,
with zero publications. This verifies the later authorized database state, not equality of new
synthetic fixtures with the earlier current-database hash. Neither cold backup was moved or deleted.

## September 18 Windows Prerequisite Regression

The M3 documentation head `1e56ea096f397f12e94ae263fb73bcdbd17ee5de` independently passes both jobs
in [CI run 35305919207](https://github.com/18803076512/arcfort-website/actions/runs/35305919207).
This is isolated Linux CI and does not prove this Windows engine is currently usable.

Windows booted at 2026-09-18 04:06:25 UTC. With autostart still false, the initial Docker pipe and
processes were absent. The ordinary Explorer desktop shortcut launched installed 4.91 processes
at 04:11:45 UTC, but the API returned HTTP 500 and no working engine. Read-only system checks find:

- `Win32_ComputerSystem.HypervisorPresent`: false.
- CPU/firmware virtualization, SLAT and VM monitor extensions: true.
- `Win32_OptionalFeature`: VirtualMachinePlatform 2 (disabled), HypervisorPlatform 2,
  Microsoft-Hyper-V-Hypervisor 2, Microsoft-Windows-Subsystem-Linux 1 (enabled).
- WslService is running; vmcompute and hns were not returned by the service query.
- WSL status reports that WSL2 is unsupported in this configuration and requests the virtual
  machine platform component. The cause or actor that disabled it has not been established.

The ordinary desktop Node probe at `.tmp/probe-docker-start-host-20260918.mjs` produced separate
write-once host reports. Actual current startup logs say `no virtualization available` and a
grpcfuse vsock listener encountered a dead network. Packaged-agent AppData reads returned an old
September 16 log, so those stale bytes are not current diagnostic evidence. The earlier PowerShell
probe exited without a report and is not counted as successful inspection.

At that diagnostic checkpoint, no Windows feature, boot setting, service startup policy, Docker
setting, data disk, WSL registration or database had been changed to address the new regression.
No reset, reinstall, prune or forced stop was performed. Database retention could not yet be
rechecked because the engine was unavailable; the September 17 result was historical evidence.

The owner subsequently gave exact approval to re-enable only VirtualMachinePlatform, preserving all
disks/distributions/containers and without automatically restarting Windows. The
[new decision](../decisions/2026-09-18-docker-virtual-machine-platform-reenable.md) records the grant
and execution. Administrator DISM completed at 04:26:05 UTC with exit 3010, `Reboot required=yes`
and explicit `/NoRestart` suppression. CIM now reports VirtualMachinePlatform enabled; the separate
HypervisorPlatform and full Hyper-V hypervisor features remain disabled. No BIOS/boot setting changed.
Current data/system disks and both cold backups remain present, with recorded backup sizes intact.

Acceptance required an owner-performed Windows restart later than this enable operation, then
ordinary startup, engine health and exact database-retention checks. The next section records that
completed gate. No complete Hyper-V role or BIOS/security change was authorized by this scope.

### Post-Enable Reboot And Retention Accepted

The subsequent authoritative read confirms Windows boot at 2026-09-18 07:06:41 UTC, later than
the 04:26:05 UTC enable operation. HypervisorPresent is true and VirtualMachinePlatform is enabled.
No Docker process/engine was present when checked. This task did not change the previously false
autostart preference. The installed shortcut, launched by the ordinary Explorer desktop, started
the engine without IPC/configuration changes.

`.tmp/verify-docker-post-vmp-20260918.mjs --self-test` passes the valid boot case and four negative
controls for old boot, invalid date, absent hypervisor and disabled feature. `--verify` then passes
against real services at 11:57:43 UTC, exit 0. The write-once report is
`.tmp/docker-post-vmp-20260918.json`; it uses the September 17 current-database baseline, not the
superseded September 14 current snapshot.

- Exact local desktop-linux pipe and Engine 29.8.0.
- All seven original container IDs/mounts and two named volumes unchanged; all are running,
  with six healthy healthchecks and REST having no healthcheck.
- Current database, all three archives and empty template match their preserved snapshots.
- All original 43 variants / 604 facts match the immutable adoption baseline, with zero publication.
- Current synthetic counts remain 46 variants, five users, four roles, one adoption, three drafts,
  six verification events and 3,727 audit events. Current hashes remain
  `042c56c6dec8c32ca1d74b2960a1c88f` / `482c05e24d2bd2e6c0afdd47207a288f`.

All database checks used READ ONLY transactions. No import/reset, Windows auto-restart, new Docker
installation, WSL registration change, disk copy or backup relocation occurred. The repair gate is
closed within these tested conditions; the cause of the earlier component disable is still unknown.
The earlier all-users two-restart proof remains historical; these new checks specifically add
post-component-enable Windows reboot and data-retention proof. Full Console V1 and real 15AK
verification/media/publication are separate unfinished work.

## Resume And Completion Gate

After an interruption, inspect actual processes, version, logs, sockets and engine before acting.
Do not reuse stale PIDs or restart on a wait timeout. Approval-service quota errors interrupted this
investigation twice; ordinary sandbox reads are not proof that host operations are available. Retry
through the normal approval path only after a verified state change or a safer scoped check.

Before declaring repair complete, verify the ordinary desktop entry point, at least two normal
stop/start cycles without manual socket surgery, healthy original containers and unchanged database
snapshots. Record Windows reboot verification separately. Backup restoration and retained-data
validation passed as recorded above; no fault-injection power-off test was performed. Never force-stop a working database
to imitate a crash. A safe launcher workaround, if eventually chosen, must be labeled a workaround
and cannot be reported as a vendor root-cause fix.

## Primary References

- [Docker Desktop release notes](https://docs.docker.com/desktop/release-notes/): 4.89 and 4.90
  advertise a stuck-socket fix, but the observed host still reproduced the failure.
- [Docker Windows installation](https://docs.docker.com/desktop/setup/install/windows-install/):
  supported per-user / WSL2 installation contract.
- [Docker enterprise deployment FAQ](https://docs.docker.com/enterprise/enterprise-deployment/faq/):
  official `-keep-data` instructions; observed self-relaunch did not preserve the flag here.
- [Microsoft MSIX flexible virtualization](https://learn.microsoft.com/en-us/windows/msix/desktop/flexible-virtualization):
  package-private AppData and registry views explain why host-visible checks are necessary.
- [Docker backup and restore](https://docs.docker.com/desktop/settings-and-maintenance/backup-and-restore/):
  fully stopped virtual-disk backup boundary.
- [Docker upstream socket report](https://github.com/docker/desktop-feedback/issues/554): related
  symptom, not proof of this host's root cause.
- [Microsoft Explorer launch guidance](https://devblogs.microsoft.com/oldnewthing/20131118-00/?p=2643):
  obtaining the actual desktop's application object rather than a new in-process shell object.
