Should be possible to add other classes if theres anyone dedicated to maintaining it. Please dont slop up the core with AI.

# Setting up development environment

This project uses node 24.20.0.

Install webapp (first time):

```bash
git clone https://github.com/GuybrushGit/ClassicSim.git
cd ClassicSim
npm install
```

Run webapp (every time):

```bash
npm run dev
```

After making code changes and testing that they work, make sure to rebuild the dist/ files:

```bash
npm run build
git add .
git commit
```
