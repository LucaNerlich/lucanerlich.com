---
title: Local Version Management with mise
description: How I manage dev toolchains with mise (mise-en-place) -- global and per-project tool versions in mise.toml, config resolution rules, tool backends (npm, pipx, GitHub, mise registry), per-directory env vars, and migrating off nvm.
tags: [mise, version-management, tooling, cli, shell]
keywords: [mise, mise-en-place, version manager, nvm, pyenv, asdf, sdkman, mise.toml, dev tools, toolchain, opencode]
---

# Local version management with mise

[mise](https://mise.jdx.dev) (short for *mise-en-place*, "everything in its
place") is a single tool that replaces a whole drawer full of version managers:
`nvm`, `pyenv`, `rbenv`, `asdf`, `sdkman`, and friends. It is written in Rust,
so version switching is essentially instant -- no slow `nvm.sh` sourcing on
every shell startup.

One tool, three jobs:

1. **Dev tools** -- install and pin per-project versions of node, python, java,
   maven, and hundreds of other tools.
2. **Environment variables** -- per-directory env vars (the `direnv`
   experience) defined right next to the tool versions.
3. **Tasks** -- a small task runner (a lighter `make` / `just`) that always
   runs with the correct tools and env loaded.

This is the version-manager half of [my shell
setup](./my-shell-setup.md); everything here works the same in zsh, bash,
fish, or scripts -- it is not tied to any shell.

## Install and activate

```bash
brew install mise
# or: curl https://mise.run | sh
```

Add to `~/.zshrc` (mise adds its tool paths automatically when active -- you do
not need it on `PATH` first). `mise activate` re-evaluates your environment on
every prompt or `cd`, so entering a project directory instantly switches to
that project's tools:

```bash title="~/.zshrc - mise"
eval "$(mise activate zsh)"
```

Verify with `mise doctor`.

## Global tools

`mise use --global` installs a tool and pins it as the default in
`~/.config/mise/config.toml`:

```bash
mise use --global node@22
mise use --global java@temurin-21
mise use --global maven
mise use --global python@3.13
```

That writes a plain TOML file you can also edit by hand:

```toml title="~/.config/mise/config.toml"
[tools]
node = "22"
java = "temurin-21"
maven = "latest"
python = "3.13"
```

## Per-project tools: `mise.toml`

Run `mise use` inside a project and it creates a `mise.toml` there. Commit it
to the repo and every teammate (or your CI, or your future self on a new
machine) gets the exact same toolchain with a single `mise install`:

```bash
cd my-project
mise use node@20          # writes ./mise.toml, installs the tool
mise install              # (re)install everything the config asks for
```

```toml title="./mise.toml"
[tools]
node = "20"
```

Fuzzy versions like `node = "20"` resolve to the newest installed 20.x, so you
get patches automatically but never a major-version surprise.

## How resolution works: global config vs. the directory you stand in

The one thing to internalize about mise: **config is hierarchical, and the
closest file wins**. When your shell needs a tool version, mise

1. walks up the directory tree from your current directory,
2. collects every `mise.toml` it finds along the way (plus the global config at
   `~/.config/mise/config.toml` and the system config in `/etc/mise`),
3. merges them, with configs **closer to you overriding** broader ones.

Concretely:

```
~/.config/mise/config.toml      # global defaults:      node@22, maven
~/workspace/aem/mise.toml       # work-wide settings:   java@temurin-11
~/workspace/aem/site/mise.toml  # this project:         node@20
```

Standing in `~/workspace/aem/site` you get node 20, java 11, and maven from
global. `node` in the parent directory is still 22 -- only the `node` entry is
overridden, everything else is inherited (tools and env vars merge per-key;
tasks from a deeper file replace same-named ones entirely).

Where this bites people: **`mise use` always writes to the directory you are
standing in**. `cd ~/projects/site && mise use node@20` creates
`~/projects/site/mise.toml` -- but run the same command in your home directory
by accident and you have just created `~/mise.toml`, which now shadows your
global config for every subdirectory of `$HOME`. Use:

- `mise use -g ...` / `mise use --global ...` -- write to
  `~/.config/mise/config.toml` (system-wide tooling)
- `mise use ...` (no flag) -- write to `./mise.toml` in the current directory
  (local workdir, commit it)
- `mise use --env local ...` -- write to `mise.local.toml`, a personal override
  file you git-ignore (e.g. your own preferred python version on top of the
  team's pin)

A few extras worth knowing:

- `mise cfg` (short for `mise config`) lists every config file mise is loading
  and its precedence -- the fastest way to answer "why is this node version
  active?". `mise which <tool>` shows the binary actually on your `PATH`.
- mise can also read idiomatic version files from other managers like
  `.nvmrc`, `.java-version`, or `rust-toolchain.toml`, so projects that never
  heard of mise still get the right versions (opt-in per tool via
  `mise settings add idiomatic_version_file_enable_tools node`).
- A `mise.toml` anywhere between `$HOME` and your project takes effect for
  everything beneath it -- handy for a monorepo-wide default, but it also means
  a stray file in a parent folder silently changes your environment.

## More than version managers: backends

mise pulls tools from many package ecosystems, not just prebuilt language
runtimes. The same `mise use` syntax works for npm packages, PyPI tools,
GitHub release binaries, and more:

```bash
mise use --global npm:@anthropic-ai/claude-code   # npm package
mise use --global pipx:black                      # PyPI via pipx
mise use --global github:BurntSushi/ripgrep       # GitHub release binary
mise use --global opencode                        # from the mise registry
```

That last one is the neat part: CLI tools I use daily -- opencode (see
[AI agent harnesses](../ai/agent-harnesses.md)), ripgrep, fzf, zoxide, even
`gh` -- can all be installed and updated through mise instead of Homebrew. One
config file, one `mise upgrade` to update everything, and your dotfiles
describe your entire toolchain. Homebrew stays useful for GUI apps and casks;
mise is great for anything CLI-shaped and version-sensitive.

## Environment variables

mise also replaces the `export` pile in `.zshrc` for project-specific values.
Variables in `mise.toml` are set automatically while you are in the directory:

```toml title="./mise.toml"
[tools]
node = "20"

[env]
NODE_ENV = "development"
_.file = ".env"   # also load a .env file, like direnv
```

If you set per-project secrets with `direnv` today, `_.file = ".env"` does the
same job without a second tool. One caveat: since these are project config
files that can define tasks and hooks, mise asks you to trust them once per
project -- just accept the prompt or run `mise trust`. For the broader
secrets story (tokens in shell profiles, rotation, secrets managers), see
[Managing secrets](./my-shell-setup.md#managing-secrets) in my shell setup
post.

## Tasks

A light bonus: define tasks in `mise.toml` and run them with `mise run`. Tasks
always execute with the project's tools and env vars loaded, and mise
auto-installs missing tools first:

```toml title="./mise.toml"
[tasks]
dev = "npm run dev"
build = "npm run build"
```

```bash
mise run build
```

## Migrating off nvm

If you currently load `nvm` in `.zshrc` (as my
[shell setup](./my-shell-setup.md) did for years), replace this slow
block:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

with `eval "$(mise activate zsh)"` and `mise use --global node@22`. The nvm
loader alone typically costs 100--300ms of shell startup; mise's hook is a few
milliseconds. The same applies to hand-pinned `JAVA_HOME` / `MAVEN_HOME`
exports -- `mise use --global java@... maven` makes them unnecessary.

## Handy commands

| Command | What it does |
|---------|--------------|
| `mise ls` | List installed and active tools |
| `mise current` | Show which versions are active in the current directory |
| `mise outdated` | Check for newer tool versions |
| `mise upgrade` | Update all installed tools (add `--bump` to also bump pins in config) |
| `mise x node@20 -- node -v` | Run a one-off command with a specific version, without installing it |
| `mise cfg` | List every config file being loaded and its precedence ("why is this version active?") |
| `mise which \<tool\>` | Show the binary that is actually on your `PATH` for a tool |
| `mise settings` | View/change settings (e.g. `mise settings experimental=true`) |
| `mise doctor` | Diagnose shell activation and config problems |
| `mise trust` | Trust a project's `mise.toml` after reviewing it |
