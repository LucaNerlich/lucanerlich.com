# My zsh Shell setup

The following steps setup my shell (zsh + oh-my-zsh).

1. Install `ghostty` terminal
    - https://ghostty.org/download
2. Install `zsh`
    - https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH
3. Install `oh-my-zsh`
    - https://ohmyz.sh/#install
4. Install `starship.rs`
    - https://starship.rs
5. Setup starpship theme
    - https://starship.rs/presets/tokyo-night
    - `starship preset tokyo-night -o ~/.config/starship.toml`

Example terminal tab in my home directory
![shell.png](assets/shell.png)

Example terminal tab in a folder with a node project
![shell-m10z.png](assets/shell-m10z.png)

When using ssh to connect to remote servers,
they might be missing
the [shell info for Ghostty](https://ghostty.org/docs/help/terminfo#copy-ghostty's-terminfo-to-a-remote-machine).
You can copy them with the following command

```bash
infocmp -x | ssh YOUR-SERVER -- tic -x -
```

## Ghostty Config

- [Keybind Documentation](https://ghostty.org/docs/config/keybind)
- [MacOS Icon Config](https://ghostty.org/docs/config/reference#macos-icon)

```
# Create window splits
keybind = alt+a=new_split:left
keybind = alt+s=new_split:down
keybind = alt+w=new_split:up
keybind = alt+d=new_split:right
keybind = alt+d=new_split:right
keybind = alt+e=new_split:auto

# Navigate window splits
keybind = alt+shift+a=goto_split:left
keybind = alt+shift+s=goto_split:bottom
keybind = alt+shift+w=goto_split:top
keybind = alt+shift+d=goto_split:right

# Other
mouse-hide-while-typing = true
keybind = cmd+w=close_surface
keybind = performable:ctrl+c=copy_to_clipboard

# Custom Icon Colors
macos-icon = custom-style
macos-icon-frame = plastic
macos-icon-ghost-color = 1C2021
macos-icon-screen-color = FA0C00

# Cursor
shell-integration-features = no-cursor
cursor-style = block
cursor-style-blink = false

# Tab Style
macos-titlebar-style = tabs
macos-titlebar-proxy-icon = hidden
split-divider-color = #222
unfocused-split-opacity = 1
```

![ghostty-icon.png](assets/ghostty-icon.png)

## .zshrc

```bash
# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:$HOME/.local/bin:/usr/local/bin:$PATH

# Path to your Oh My Zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time Oh My Zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="robbyrussell"

# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in $ZSH/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment one of the following lines to change the auto-update behavior
# zstyle ':omz:update' mode disabled  # disable automatic updates
# zstyle ':omz:update' mode auto      # update automatically without asking
# zstyle ':omz:update' mode reminder  # just remind me to update when it's time

# Uncomment the following line to change how often to auto-update (in days).
# zstyle ':omz:update' frequency 13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# You can also set it to another string to have that shown instead of the default red dots.
# e.g. COMPLETION_WAITING_DOTS="%F{yellow}waiting...%f"
# Caution: this setting can cause issues with multiline prompts in zsh < 5.7.1 (see #5765)
COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
  git
)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='nvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch $(uname -m)"

# Set personal aliases, overriding those provided by Oh My Zsh libs,
# plugins, and themes. Aliases can be placed here, though Oh My Zsh
# users are encouraged to define aliases within a top-level file in
# the $ZSH_CUSTOM folder, with .zsh extension. Examples:
# - $ZSH_CUSTOM/aliases.zsh
# - $ZSH_CUSTOM/macos.zsh
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

fpath=(~/.local/share/zsh/functions $fpath)
autoload -Uz compinit
compinit -u

## ZSH Config
PROMPT='%(?.%F{green}√.%F{red}?%?)%f %B%F{240}%~%f%b %# '

## Java 8
#export JAVA_HOME='/Users/nerlich/tech/jdk8u292-b10/Contents/Home'
#export PATH=$JAVA_HOME:$PATH

## Java 11
export JAVA_HOME='/Users/nerlich/tech/jdk-11-arm/Home'
export PATH=$JAVA_HOME:$PATH

## Maven
export MAVEN_HOME='/Users/nerlich/tech/apache-maven-3.8.4/bin'
export PATH=$MAVEN_HOME:$PATH

## Ngrok
export ngrok='/Users/nerlich/tech/ngrok'
export PATH=$ngrok:$PATH

## AEM
export githubToken='ghp_<redacted>'
export PATH=$githubToken:$PATH
export GITHUB_ACCESS_TOKEN_CLASSIC='ghp_<redacted>'

# FileSystem
alias ls='ls -GFh'
alias cp='cp -iv'                           # Preferred 'cp' implementation
alias mv='mv -iv'                           # Preferred 'mv' implementation
alias mkdir='mkdir -pv'                     # Preferred 'mkdir' implementation
alias ll='ls -FGlAhp'                       # Preferred 'ls' implementation
alias less='less -FSRXc'                    # Preferred 'less' implementation
cd() { builtin cd "$@"; ll; }               # Always list directory contents upon 'cd'
alias cd2='cd ../../'                       # Go back 2 directory levels
alias cd3='cd ../../../'                     # Go back 3 directory levels
alias cd4='cd ../../../../'                  # Go back 4 directory levels
alias cd5='cd ../../../../../'               # Go back 5 directory levels
alias cd6='cd ../../../../../../'            # Go back 6 directory levels
alias f='open .'

# Docker
alias dcu='docker-compose pull && docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcb='docker-compose build'

# Git
alias gitfast='git pull && git add . && git commit -m "shortcut alias for minor changes" && git push'
export gh='/Users/nerlich/tech/gh_2.64.0/bin'
export PATH=$gh:$PATH

# Maven
alias mci='mvn clean install'
alias mcip='mvn clean install -PautoInstallSinglePackage'
alias mcipp='mvn clean install -PautoInstallSinglePackagePublish'
alias mcipst='mvn clean install -PautoInstallSinglePackage -DskipTests'

# Node
alias nrd='npm run dev'
alias nrb='npm run build'
alias nrbs='npm run build && npm run start'

# Networking
alias myip="ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1'"
alias netCons='lsof -i'                             # netCons:      Show all open TCP/IP sockets
alias lsock='sudo /usr/sbin/lsof -i -P'             # lsock:        Display open sockets
alias lsockU='sudo /usr/sbin/lsof -nP | grep UDP'   # lsockU:       Display only open UDP sockets
alias lsockT='sudo /usr/sbin/lsof -nP | grep TCP'   # lsockT:       Display only open TCP sockets
alias flushdns='sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder; say DNS cache flushed '

# Adobe AppBuilder
alias aiodev='aio app dev'
alias aiodep='aio app deploy'
alias aiodpl='aio app deploy'
alias aiolog='aio app logs'
alias aiouse='aio app use'
alias aiort='aio rt'
alias aioact='aio rt activation'
alias aioinv='aio rt action invoke'
alias aiores='aio rt activation result'
alias aioll='aio rt activations list -l 60'
alias aiols='aio rt activations list -l 10'
alias aiolst='aio rt activations list -l 10'
alias aiocm='aio cloudmanager'
alias aiorde='aio aem rde'
alias aiolgi='aio login --no-open'
alias aiolgo='aio logout --force'
alias aiocsl='aio console'
alias aioorg='aio console org select'
alias aioprj='aio console project select'
alias aiows='aio console ws select'
alias aiocfg='aio config'
alias aioplg='aio plugins'
alias aioinf='aio info'
alias aioo='aio where'

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
export PATH="$PATH:/Users/nerlich/.local/bin" # Added by Docker Labs Debug Tools"

# Added by LM Studio CLI (lms)
export PATH="$PATH:/Users/nerlich/.cache/lm-studio/bin"

# Starship.rs
# curl -sS https://starship.rs/install.sh | sh
eval "$(starship init zsh)"
```

## powershell .profile

File Location: `C:\Users\lucan\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`

```powershell title="C:\Users\lucan\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"
# Linux-like aliases for PowerShell
Set-Alias -Name ll -Value Get-ChildItem
function ll { Get-ChildItem -Force @args | Format-Table -AutoSize }
function ls { Get-ChildItem @args }
function grep { Select-String @args }
function pwd { (Get-Location).Path }
function touch { New-Item -ItemType File @args }
function cp { Copy-Item @args }
function mv { Move-Item @args }
function rm { Remove-Item @args }
function cat { Get-Content @args }
function clear { Clear-Host }
function mkdir { New-Item -ItemType Directory @args }
function man { Get-Help @args }
function find { Get-ChildItem -Recurse -Filter @args }
function diff { Compare-Object @args }
function history { Get-History }

Write-Host "Linux-like aliases loaded!" -ForegroundColor Green

#region Environment path additions
$env:PATH = "$env:ConEmuBaseDir\Scripts;$env:PATH"
$env:PATH = "C:\Users\Luca\WPy64-3910\python-3.9.1.amd64;$env:PATH"
#endregion

#region Directory navigation aliases
function cd2 { Set-Location -Path ..\.. }
function cd3 { Set-Location -Path ..\..\.. }
function cd4 { Set-Location -Path ..\..\..\.. }
function f { Start-Process . }
#endregion

#region Project directory shortcuts
function cdi { Set-Location -Path "E:\workspace\luca\" }
function cds { Set-Location -Path "E:\workspace\luca\code\projects\strapi\cffc-v4\" }
function cdc { Set-Location -Path "E:\workspace\luca\code\projects\cffc\" }
function cdc4ca { Set-Location -Path "E:\workspace\adobe\VW\author-c4c\crx-quickstart\bin\" }
function cdc4cp { Set-Location -Path "E:\workspace\adobe\VW\publish-c4c\crx-quickstart\bin\" }
#endregion

#region NPM aliases
function npmil { npm install --legacy-peer-deps }
function nrd { npm run dev }
function nrb { npm run build }
function nrs { npm run start }
function nrbs { npm run build; npm run start }
function npmu { npm update }
function npmi { npm install }
#endregion

#region Maven aliases
function mci { mvn clean install -T 1C }
function mcip { mvn clean install -PautoInstallSinglePackage }
function mcipst { mvn clean install -PautoInstallSinglePackage -DskipTests }
function mcipp { mvn clean install -PautoInstallSinglePackagePublish }
function mcib { mvn clean install -PautoInstallBundle }
function msonar { mvn clean verify sonar:sonar -Dsonar.projectKey=R4C -Dsonar.host.url=http://localhost:9000 -Dsonar.login=sqp_d1de0f4ad3b96a15cacf5c725d77fda62516e093 }
#endregion

#region Docker aliases
function dcu { docker-compose pull; docker-compose up -d --remove-orphans }
function dcul { docker-compose -f docker-compose-local.yml build; docker-compose -f docker-compose-local.yml up }
function dcd { docker-compose down }
#endregion

#region Version check alias
function ii { java -version; mvn -version }
#endregion

#region Dispatcher reload
function dispatcherreload { 
    if (Test-Path out) { Remove-Item -Recurse -Force out } 
    bin\validator.exe full -d out src 
    bin\docker_run.cmd out host.docker.internal:4503 8081 
}
#endregion

#region Project navigation aliases - SAP
function edge { Set-Location -Path "E:\workspace\adobe\SAP\builder-prospect-edge-worker\root\qa-headless-commerce" }
function eds { Set-Location -Path "E:\workspace\adobe\SAP\builder-prospect-aem-dev" }
function sapa { 
    Set-Location -Path "E:\workspace\adobe\SAP\author\crx-quickstart\bin"
    .\start.bat
}
function appb { Set-Location -Path "E:\workspace\adobe\SAP\builder-prospect-app-builder-pdp" }
function sap { Set-Location -Path "E:\workspace\adobe\SAP\builder-prospect-aem-sapdx" }
#endregion

#region Adobe I/O aliases
function aiodev { aio app dev }
function aiodep { aio app deploy }
function aiodpl { aio app deploy }
function aiolog { aio app logs }
function aiouse { aio app use }
function aiort { aio rt }
function aioact { aio rt activation }
function aioinv { aio rt action invoke }
function aiores { aio rt activation result }
function aioll { aio rt activations list -l 60 }
function aiols { aio rt activations list -l 10 }
function aiolst { aio rt activations list -l 10 }
function aiocm { aio cloudmanager }
function aiorde { aio aem rde }
function aiolgi { aio login --no-open }
function aiolgo { aio logout --force }
function aiocsl { aio console }
function aioorg { aio console org select }
function aioprj { aio console project select }
function aiows { aio console ws select }
function aiocfg { aio config }
function aioplg { aio plugins }
function aioinf { aio info }
function aioo { aio where }
#endregion

Write-Host "Custom aliases loaded successfully!" -ForegroundColor Cyan
```
