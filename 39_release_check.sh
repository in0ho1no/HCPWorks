#!/bin/bash
set -e
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

for script in \
	20_check_vulnerabilities.sh \
	21_update.sh \
	22_check_overrides.sh \
	30_pre-test.sh \
	31_test.sh \
	32_build.sh
do
	printf '\n=== Running %s ===\n' "$script"
	bash "$script" || {
		status=$?
		printf 'Failed: %s (exit code %s). Stopping release checks.\n' "$script" "$status" >&2
		exit "$status"
	}
done

printf '\nAll release checks completed.\n'
