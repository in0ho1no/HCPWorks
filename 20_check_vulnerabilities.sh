#!/bin/bash
set -e
cd ./hcpworks

echo "Check vulnerabilities..."
if npm audit; then
	echo "No vulnerabilities found."
	printf "Done.\n"
	exit 0
fi

printf "npm audit reported vulnerabilities.\n"
read -r -p "Run npm audit fix? [y/N] " answer
case "$answer" in
	[yY]|[yY][eE][sS])
		npm audit fix
		;;
	*)
		echo "Skipped npm audit fix."
		;;
esac

echo "Done."
