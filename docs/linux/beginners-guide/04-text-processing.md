---
title: "Text Processing"
sidebar_label: "Text Processing"
description: Read, search, and transform text files using cat, grep, sed, awk, and shell pipes and redirection.
slug: /linux/beginners-guide/text-processing
tags: [linux, bash, shell, beginners]
keywords:
  - grep sed awk
  - linux pipes redirection
  - cat less head tail
  - sort uniq wc cut
  - shell text processing
sidebar_position: 4
---

# Text Processing

Linux systems are built around plain text. Configuration files, logs, data files, and command output are all text. Knowing how to search, filter, extract, and transform text from the command line is one of the highest-leverage skills you can develop. A few minutes of competence with `grep`, `awk`, and pipes can replace hours of manual work.

---

## Reading Files

### `cat` — Print Entire File

`cat` (concatenate) prints the full contents of a file to the terminal.

```bash
# Print a file
cat /etc/hostname

# Print multiple files in sequence
cat header.txt body.txt footer.txt

# Show line numbers
cat -n app.conf

# Show non-printing characters and mark line endings
cat -A file.txt
```

`cat` is fine for small files. For large files, use `less`.

### `less` — Paginated Reading

`less` opens a file for reading one page at a time. It does not load the entire file into memory, making it ideal for large log files.

```bash
less /var/log/syslog

# Open and search immediately
less +/ERROR /var/log/syslog
```

Key bindings inside `less`:

| Key | Action |
|---|---|
| `Space` / `f` | Page forward |
| `b` | Page backward |
| `g` | Go to beginning |
| `G` | Go to end |
| `/pattern` | Search forward |
| `n` | Next match |
| `N` | Previous match |
| `q` | Quit |

### `head` — First Lines

```bash
# Show first 10 lines (default)
head /var/log/syslog

# Show first 50 lines
head -n 50 /var/log/syslog

# Show first 100 bytes
head -c 100 /var/log/syslog
```

### `tail` — Last Lines

```bash
# Show last 10 lines (default)
tail /var/log/nginx/error.log

# Show last 100 lines
tail -n 100 /var/log/nginx/error.log

# Follow a file as it grows (essential for watching logs in real time)
tail -f /var/log/nginx/access.log

# Follow with retry (keeps watching even if the file is rotated/recreated)
tail -F /var/log/nginx/access.log

# Combine: show last 50 lines, then follow
tail -n 50 -f /var/log/myapp/app.log
```

`tail -f` is invaluable during deployments and debugging. Open it in one terminal, trigger requests or actions in another.

---

## Pipes and Redirection

Pipes and redirection are the glue that connects individual tools into powerful processing pipelines.

### Pipe — `|`

A pipe sends the standard output of one command as the standard input of the next.

```bash
# Count the number of lines in a file
cat /var/log/syslog | wc -l

# Show only lines containing ERROR
cat /var/log/syslog | grep ERROR

# Chain multiple operations
cat /var/log/nginx/access.log | grep "POST" | grep "500" | tail -20
```

### Output Redirection

```bash
# Write output to a file (overwrites)
ls -la > file-list.txt

# Append output to a file
echo "$(date): deployment complete" >> /var/log/deploy.log

# Discard output
find / -name "*.conf" 2>/dev/null > /dev/null

# Write standard error to a file
command 2> errors.txt

# Write both stdout and stderr to the same file
command > output.txt 2>&1

# Shorter syntax for the same thing (bash 4+)
command &> output.txt
```

### Input Redirection

```bash
# Feed a file as input to a command
mysql -u root -p mydb < schema.sql

# Here-string: provide a string as stdin
grep "ERROR" <<< "some ERROR message here"
```

### Common Redirect Targets

| Redirect | Meaning |
|---|---|
| `> file` | Stdout to file (overwrite) |
| `>> file` | Stdout to file (append) |
| `2> file` | Stderr to file |
| `2>&1` | Stderr to same destination as stdout |
| `&> file` | Both stdout and stderr to file |
| `> /dev/null` | Discard stdout |
| `2>/dev/null` | Discard stderr |

---

## Searching Text — `grep`

`grep` searches for lines matching a pattern in files or standard input.

```bash
# Basic search
grep "ERROR" /var/log/syslog

# Case-insensitive
grep -i "error" /var/log/syslog

# Invert match (lines that do NOT match)
grep -v "DEBUG" /var/log/app.log

# Show line numbers
grep -n "NullPointerException" app.log

# Count matching lines
grep -c "ERROR" /var/log/syslog

# Recursive search through a directory
grep -r "database.host" /etc/myapp/

# Recursive, case-insensitive, with line numbers
grep -rin "api_key" /opt/myapp/config/

# Only show filenames that contain the pattern
grep -l "ERROR" /var/log/*.log

# Show context: 3 lines before and after each match
grep -C 3 "OutOfMemoryError" /var/log/app.log

# Show 5 lines after each match
grep -A 5 "Exception" /var/log/app.log

# Show 2 lines before each match
grep -B 2 "FATAL" /var/log/app.log
```

### Regular Expressions in grep

```bash
# Lines starting with "Error"
grep "^Error" app.log

# Lines ending with "OK"
grep "OK$" app.log

# Lines containing a 4-digit number
grep "[0-9]\{4\}" access.log

# Use extended regex syntax (no backslash needed for +, ?, |, {})
grep -E "ERROR|WARN|FATAL" /var/log/app.log

# IP address pattern
grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}" access.log

# Lines with two or more consecutive spaces
grep -E "  +" data.txt
```

### Practical grep Patterns

```bash
# Watch for errors in a running log
tail -f /var/log/app.log | grep --line-buffered "ERROR"

# Find all Java stack traces (lines starting with "at ")
grep -E "^\s+at " /var/log/app.log

# Count HTTP status codes in nginx log
grep -oP '"[A-Z]+ [^"]*" \K[0-9]{3}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# Find all config files containing a database password
grep -rl "db_password" /etc/ /opt/ 2>/dev/null
```

---

## Stream Editing — `sed`

`sed` (stream editor) reads input line by line, applies editing commands, and prints the result. It is most commonly used for find-and-replace.

### Substitution

```bash
# Basic substitution: replace first occurrence per line
sed 's/old/new/' input.txt

# Replace all occurrences per line (global flag)
sed 's/old/new/g' input.txt

# Case-insensitive replacement
sed 's/error/ERROR/gi' input.txt

# Replace and write back to file (-i = in-place)
sed -i 's/localhost/db.example.com/g' /etc/myapp/config.conf

# Create a backup before in-place editing
sed -i.bak 's/old/new/g' config.conf
# Creates config.conf.bak with original content

# Replace only on lines matching a pattern
sed '/^#/s/old/new/g' file.txt

# Use a different delimiter (useful when the pattern contains /)
sed 's|/old/path|/new/path|g' config.txt
```

### Deleting Lines

```bash
# Delete lines matching a pattern
sed '/^#/d' config.conf          # delete comment lines
sed '/^$/d' file.txt             # delete empty lines
sed '/DEBUG/d' app.log           # delete DEBUG lines

# Delete a specific line number
sed '5d' file.txt

# Delete a range of lines
sed '10,20d' file.txt

# Delete from line 5 to end of file
sed '5,$d' file.txt
```

### Printing Specific Lines

```bash
# Print only lines 10 to 20 (-n suppresses default output)
sed -n '10,20p' file.txt

# Print lines matching a pattern
sed -n '/ERROR/p' app.log

# Print line numbers with matches
sed -n '/ERROR/=' app.log
```

### Practical sed Examples

```bash
# Update a version number in a file
sed -i 's/version=.*/version=1.2.3/' build.properties

# Comment out a line in a config file
sed -i 's/^DANGEROUS_SETTING/#DANGEROUS_SETTING/' config.conf

# Remove trailing whitespace from all lines
sed -i 's/[[:space:]]*$//' file.txt

# Insert a line after a match
sed -i '/^Host myserver$/a\    StrictHostKeyChecking no' ~/.ssh/config

# Replace a specific config value
sed -i "s|max_connections = .*|max_connections = 200|" /etc/postgresql/14/main/postgresql.conf
```

---

## Field Processing — `awk`

`awk` is a full programming language for processing structured text. It splits each line into fields (separated by whitespace by default) and lets you act on them.

### Basic Field Access

```bash
# Fields are $1, $2, $3... $NF is the last field
echo "John Smith 42" | awk '{print $1}'     # John
echo "John Smith 42" | awk '{print $2}'     # Smith
echo "John Smith 42" | awk '{print $NF}'    # 42 (last field)
echo "John Smith 42" | awk '{print $1, $3}' # John 42
```

### Custom Field Separator

```bash
# Use comma as separator (-F)
echo "john,smith,42" | awk -F',' '{print $1}'

# Use colon (for /etc/passwd)
awk -F':' '{print $1}' /etc/passwd           # all usernames

# First field of /etc/passwd for users with /bin/bash
awk -F':' '$7 == "/bin/bash" {print $1}' /etc/passwd
```

### Filtering Rows

```bash
# Print lines where field 3 > 100
awk '$3 > 100' data.txt

# Print lines where field 1 matches a pattern
awk '$1 ~ /^ERROR/' app.log

# Lines where field 2 equals "admin"
awk '$2 == "admin"' users.txt
```

### Processing nginx Access Logs

```bash
# Example log line:
# 192.168.1.1 - - [10/Apr/2026:09:00:01 +0000] "GET /api/health HTTP/1.1" 200 42 "-" "curl/7.81.0"

# Extract IP addresses
awk '{print $1}' /var/log/nginx/access.log

# Print lines where HTTP status is 500
awk '$9 == 500' /var/log/nginx/access.log

# Count requests per IP (top 10)
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head 10

# Total bytes transferred
awk '{sum += $10} END {print sum}' /var/log/nginx/access.log
```

### BEGIN and END Blocks

```bash
# BEGIN runs before any lines, END runs after all lines
awk 'BEGIN {print "Report:"} {count++} END {print "Total lines:", count}' file.txt

# Sum a column with a header
awk 'NR > 1 {sum += $3} END {print "Total:", sum}' report.csv
```

---

## Extracting Fields — `cut`

`cut` is simpler than awk — use it when you just need specific fields.

```bash
# Extract characters 1-10
cut -c1-10 file.txt

# Extract field 1 with colon delimiter
cut -d':' -f1 /etc/passwd

# Extract fields 1 and 3
cut -d',' -f1,3 data.csv

# Extract from field 2 to end of line
cut -d',' -f2- data.csv

# Extract the username from 'git log --pretty="%an"' output
git log --pretty="%an" | sort | uniq -c | sort -rn
```

---

## Sorting — `sort`

```bash
# Sort alphabetically (default)
sort names.txt

# Sort in reverse
sort -r names.txt

# Sort numerically
sort -n numbers.txt

# Sort by specific field (column 2, using comma separator)
sort -t',' -k2 data.csv

# Sort by column 3 numerically, descending
sort -t',' -k3 -rn data.csv

# Remove duplicate lines (sort + unique)
sort -u names.txt

# Sort by file size (the first field of ls -s output)
ls -s /var/log/*.log | sort -n
```

---

## Unique Lines — `uniq`

`uniq` filters adjacent duplicate lines. Always sort first unless you want to keep non-adjacent duplicates.

```bash
# Remove consecutive duplicate lines
sort names.txt | uniq

# Count occurrences of each line
sort names.txt | uniq -c

# Show only duplicate lines
sort names.txt | uniq -d

# Show only unique (non-duplicated) lines
sort names.txt | uniq -u

# Case-insensitive comparison
sort names.txt | uniq -i
```

### Counting Occurrences Pattern

This is one of the most frequently used pipelines in log analysis:

```bash
# Top 10 most frequent values in a column
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head 10

# Count HTTP methods in nginx log
awk '{print $6}' access.log | tr -d '"' | sort | uniq -c | sort -rn
```

---

## Word and Line Count — `wc`

```bash
# Count lines, words, and bytes
wc file.txt
# 42 300 1842 file.txt

# Count only lines
wc -l /var/log/syslog

# Count only words
wc -w document.txt

# Count only characters
wc -c binary.dat

# Count lines across multiple files
wc -l /var/log/*.log
```

---

## Putting It All Together

### Real-World Log Analysis Pipeline

```bash
# Find the top 10 URLs returning 500 errors in the last hour
# (assumes nginx access log format)
tail -n 50000 /var/log/nginx/access.log \
  | awk '$9 == 500 {print $7}' \
  | sort | uniq -c | sort -rn \
  | head 10
```

### Extract Unique IP Addresses That Hit the Login Endpoint

```bash
grep "POST /api/login" /var/log/nginx/access.log \
  | awk '{print $1}' \
  | sort -u
```

### Find the Largest Log Files and Their Line Counts

```bash
find /var/log -name "*.log" -type f -size +1M \
  | xargs wc -l \
  | sort -rn \
  | head 20
```

### Replace a Config Value Across Multiple Files

```bash
grep -rl "old.database.host" /etc/myapp/ \
  | xargs sed -i 's/old.database.host/new.database.host/g'
```

### Parse a CSV Report

```bash
# Sum column 4 of a CSV file (skipping the header)
tail -n +2 report.csv \
  | cut -d',' -f4 \
  | awk '{sum += $1} END {printf "Total: %.2f\n", sum}'
```
