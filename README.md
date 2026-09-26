# Cimes

Jeu 3D low-poly : vous êtes un pilote sur un aérodrome de montagne. Marchez, prenez la jeep ou un avion, décollez, enfilez les anneaux du massif, puis atterrissez.

## Jouer (navigateur)

```bash
npm install
npm run dev
```

Puis **Entrer sur le tarmac**.

## Commandes

| Action | Clavier |
| --- | --- |
| Marcher / rouler / gaz | `Z Q S D` ou `W A S D` |
| Regard / cabrer | Souris |
| Monter dans un véhicule | `E` |
| Sauter (à pied) | Espace |
| Filaire | `F` |
| Jour / nuit | `N` |

Au sol, accélérez sur la piste, tirez la souris pour cabrer, puis suivez les anneaux. Revenez atterrir pour finir le circuit.

## Windows (.exe)

Le workflow GitHub Actions **Windows exe** produit un exécutable portable.

1. Sur GitHub : **Actions → Windows exe → Run workflow**
2. Télécharge l’artefact `Cimes-Windows` (`Cimes-1.0.0-win.exe`)
3. Ou pousse un tag `v1.0.0` : l’exe est aussi attaché à la release

```bash
npm install
npm install -D electron electron-builder
npm run desktop:build
npm run desktop:pack   # de préférence sur Windows / via Actions
```

## Stack

React, TanStack Start, Three.js, terrain procédural (simplex noise). Electron pour le build desktop.
