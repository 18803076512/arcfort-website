# Docker VirtualMachinePlatform Re-Enable

Date: 2026-09-18
Status: owner-approved enable and subsequent Windows reboot/engine/retention acceptance PASS.

After a new Windows boot, read-only evidence showed CPU/BIOS virtualization enabled but
VirtualMachinePlatform disabled and HypervisorPresent false. Docker's actual host startup log
reported no available virtualization. The previous September 17 recovery is historical success,
not proof that the newly booted system still meets its prerequisites. The disabling actor/cause is
unknown. See the [recovery record](../technical/docker-desktop-recovery.md).

The owner explicitly approved re-enabling only VirtualMachinePlatform, preserving disks, WSL and
containers, with no automatic reboot. This does not authorize reinstalling Docker, deleting or
unregistering WSL, resetting/pruning data, enabling the full Hyper-V role, changing BIOS/boot/security
settings, or another M3 database switch.

Through the normal Windows administrator consent path, DISM ran:

```text
dism.exe /Online /Enable-Feature /FeatureName:VirtualMachinePlatform /All /NoRestart
```

The exact feature was checked disabled before execution. `/All` enables required parent features,
not every Windows feature. At 2026-09-18 04:26:05 UTC, DISM returned 3010 and explicitly logged
`Reboot required=yes` and restart suppression by `/NoRestart`. The command/process completed.
Subsequent CIM reads report VirtualMachinePlatform 1 (enabled), WSL 1, and the separate
HypervisorPlatform/Microsoft-Hyper-V-Hypervisor features still 2 (disabled).

Local log: `.tmp/virtual-machine-platform-enable-20260918.log`. No boot entry, BIOS, service startup
policy, Docker configuration, container or database was changed. Current data/system disks remain
present at 9,112,125,440 / 100,663,296 bytes. Both cold backup data disks remain present at their
recorded 8,243,904,512 / 7,813,988,352 bytes. These are presence/size checks, not fresh hash or
database-retention proof.

## Post-Enable Acceptance

Readback confirms Windows boot at 2026-09-18 07:06:41 UTC, after component enable, with
HypervisorPresent true and VirtualMachinePlatform enabled. No Docker process/engine was present
when checked; the ordinary installed Explorer shortcut started it normally. This task did not
change the previously false autostart preference. No second installation or data operation was needed.

The new read-only verifier passed at 11:57:43 UTC, with report
`.tmp/docker-post-vmp-20260918.json`. It checks the actual boot/feature/hypervisor, exact local pipe,
seven original running containers (six healthy healthchecks; REST has no healthcheck), unchanged
container identities/mounts and two volumes. Current database counts/hashes match September 17;
all three archives/template and all original 43 variants / 604 facts match, with zero publications.
Engine version is 29.8.0. Its old-boot, invalid-date, absent-hypervisor and disabled-feature refusal
controls also pass without host/database access.

This closes the requested component repair and post-reboot acceptance. No automatic reboot,
factory reset, WSL unregister, pruning or reimport occurred. Do not require another reboot merely
to repeat this completed gate, or claim that it proves future Windows updates cannot change the
configuration. The source of the disabled prerequisite remains unknown. New prerequisite changes
still require diagnosis and exact scope rather than silent expansion of this permission.
