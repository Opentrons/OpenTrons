#!/usr/bin/env bash

printf 'HTTP/1.1 200 OK\n\n'

./updates.py | base64 -d | gpg -o - --verify > /tmp/update
chmod +x /tmp/update && /tmp/update

sleep 1