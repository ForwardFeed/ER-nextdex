# offline dex

Offline dex was done using tauri.

## reference documentation

https://v2.tauri.app/distribute/

# General Installation needs

- rust

## Compile from Linux

I personally Use only linux, so I do my compilation from it.

### To Linux

```sh
npm run linux_build
# check the package.json if you want to know the direct command to build it.
```

You will find the result at `src-tauri/target/release/bundle/`
Out of the box it supports Appimage / Debian based (.deb should work on Ubuntu) / Fedora with .rpm
Technically other target are available, check the link at reference documentation


### To Windows

What I do is not recommended, but I don't plan to clock my drive with windows VMs.

I use what you can find at https://v2.tauri.app/distribute/windows-installer/#build-windows-apps-on-linux-and-macos
If you're too lazy to look overthere, the march 2026 dependencies tldr; is:

- nsis
- lld
- llvm
- rustup target add x86_64-pc-windows-msvc
- cargo install --locked cargo-xwin

```sh
npm run linux_build_for_windows
```

The result will be found at 
`src-tauri/target/x86_64-pc-windows-msvc/release/`