{
  description = "Spacebar Admin API, written in C#.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachSystem flake-utils.lib.allSystems (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        hashesFile = builtins.fromJSON (builtins.readFile ./hashes.json);
        lib = pkgs.lib;
      in
      {
        packages = {
          default = pkgs.buildNpmPackage {
            pname = "spacebar-server-ts";
            name = "spacebar-server-ts";

            meta = with lib; {
              description = "Spacebar server, a FOSS reimplementation of the Discord backend.";
              homepage = "https://github.com/spacebarchat/server";
              license = licenses.agpl3Plus;
              platforms = platforms.all;
              mainProgram = "start-bundle";
            };

            src = ./.;
            nativeBuildInputs = with pkgs; [ python3 ];
            npmDepsHash = hashesFile.npmDepsHash;
            makeCacheWritable = true;
            postPatch = ''
              substituteInPlace package.json --replace 'npx patch-package' '${pkgs.nodePackages.patch-package}/bin/patch-package'
            '';
            installPhase = ''
              runHook preInstall
              set -x
              #remove packages not needed for production, or at least try to...
              npm prune --omit dev --no-save $npmInstallFlags "''${npmInstallFlagsArray[@]}" $npmFlags "''${npmFlagsArray[@]}"
              find node_modules -maxdepth 1 -type d -empty -delete

              mkdir -p $out
              cp -r assets dist node_modules package.json $out/
              for i in dist/**/start.js
              do
                makeWrapper ${pkgs.nodejs}/bin/node $out/bin/start-`dirname ''${i/dist\//}` --prefix NODE_PATH : $out/node_modules --add-flags $out/$i
              done

              set +x
              runHook postInstall
            '';
          };

          update-nix = pkgs.writeShellApplication {
            name = "update-nix";
            runtimeInputs = with pkgs; [
              prefetch-npm-deps
              nix
              jq
            ];
            text = ''
              nix flake update --extra-experimental-features 'nix-command flakes'
              DEPS_HASH=$(prefetch-npm-deps package-lock.json)
              TMPFILE=$(mktemp)
              jq '.npmDepsHash = "'"$DEPS_HASH"'"' hashes.json > "$TMPFILE"
              mv -- "$TMPFILE" hashes.json
            '';
          };
        };

        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            nodePackages.typescript
            nodePackages.ts-node
            nodePackages.patch-package
            nodePackages.prettier
          ];
        };
      }
    );
}
