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

## .zshrc

```shell
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
