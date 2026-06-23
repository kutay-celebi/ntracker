#!/usr/bin/env sh
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: pnpm release <version>"
  echo "Example: pnpm release 1.4.0"
  exit 1
fi

# Validate semver format
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "ERROR: Invalid version format '$VERSION'. Expected: x.y.z"
  exit 1
fi

# Check [Unreleased] section has content
UNRELEASED=$(awk '/^## \[Unreleased\]/{found=1; next} found && /^## \[/{exit} found && NF{print}' CHANGELOG.md)

if [ -z "$UNRELEASED" ]; then
  echo "ERROR: [Unreleased] section in CHANGELOG.md is empty."
  echo "Add your changes under [Unreleased] before releasing."
  exit 1
fi

echo "Releasing v$VERSION..."

# Read current version before bumping (needed for README update)
OLD_VERSION=$(node -p "require('./package.json').version")

# Update version in package.json first (kacl release reads version from here)
npm version "$VERSION" --no-git-tag-version

# Move [Unreleased] to versioned section using version from package.json
pnpm kacl release

# Update download URLs in README.md
sed -i '' "s/$OLD_VERSION/$VERSION/g" README.md
echo "README.md updated: $OLD_VERSION → $VERSION"

echo ""
echo "Changes staged. Review with: git diff"
echo ""
echo "When ready, run:"
echo "  git add CHANGELOG.md package.json pnpm-lock.yaml README.md"
echo "  git commit -m \"release: v$VERSION\""
echo "  git tag $VERSION"
echo "  git push && git push --tags"
