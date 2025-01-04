# Command Line Tips and Tricks

## Git

### Config Overview

1. System-spezifische Konfiguration - `git config --system -l`
2. User-spezifische Konfiguration I - `git config --global -l`
3. User-spezifische Konfiguration II - `git config --global -l`
4. Repository-spezifische Konfiguration - `git config --local -l`

Show all config locations

```bash
$ git config --list --show-origin
```

```bash
# zeigt alle Einträge der globalen .gitconfig
$ git config --global --list

# zeigt ALLE Konfigurationen (nicht nur die globalen)
$ git config --list

# öffnet globale .gitconfig zum editieren in VIM
$ git config --global --edit

# zeigt die Lokationen aller Konfigurationen
$ git config --list --show-origin

# System, applies to entire machine and all users
$ git config --system --list
$ git config --system --edit

# User defined
$ git config --global --list
$ git config --global --edit
```

https://gist.github.com/Tset-Noitamotua/815ac565b93dd3cb4118101f6fb0f96a

