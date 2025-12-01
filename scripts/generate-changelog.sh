#!/bin/bash

# --- Changelog Generation Script (generate_changelog.sh) ---
# FIX: Includes robust range checking and debugging output.

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: Must be run inside a Git repository."
    exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
CHANGELOG_FILE="$REPO_ROOT/CHANGELOG.md"

declare -A CATEGORIES=(
    ["feat:"]="### Added" ["add:"]="### Added" ["fix:"]="### Fixed" ["bug:"]="### Fixed"
    ["perf:"]="### Changed" ["refactor:"]="### Changed" ["change:"]="### Changed" 
    ["deprecate:"]="### Deprecated" ["removed:"]="### Removed" ["BREAKING CHANGE"]="### Removed"
    ["docs:"]="### Documentation" ["security:"]="### Security" ["chore:"]="### Internal/Maintenance" 
    ["style:"]="### Internal/Maintenance" ["ci:"]="### Internal/Maintenance"
)

# Function to process a single commit range and append to the changelog
process_commits() {
    local TAG_A=$1
    local TAG_B=$2
    local VERSION=$3
    local DATE=$4
    local HEADER_LEVEL=$5

    # Use three dots for the primary range (commits unique to TAG_B)
    local RANGE="${TAG_A}...${TAG_B}"
    # Use two dots as a fallback (commits between the two points)
    local FALLBACK_RANGE="${TAG_A}..${TAG_B}"
    
    echo "--- DEBUG: Attempting to process version $VERSION (Date: $DATE) ---"

    # Try the primary range (three dots)
    local COMMITS=$(git log "$RANGE" --pretty=format:'%s' --no-merges)
    local RANGE_USED="$RANGE"

    # Check if the primary range returned nothing, and try the fallback
    if [ -z "$COMMITS" ]; then
        local COMMITS=$(git log "$FALLBACK_RANGE" --pretty=format:'%s' --no-merges)
        RANGE_USED="$FALLBACK_RANGE (Fallback)"
    fi

    echo "--- DEBUG: Git Log Range used: $RANGE_USED"
    
    # Check if there are any commits to process
    if [ -z "$COMMITS" ]; then
        echo "Skipping: $VERSION (0 commits found in either range)"
        return
    fi
    
    echo "--- DEBUG: Commits found (Raw):"
    echo "$COMMITS" | sed 's/^/> /' # Print raw commits prefixed with >
    echo "--------------------------"
    
    # Append the version header (Version and Date)
    echo "$HEADER_LEVEL $VERSION - $DATE" >> "$CHANGELOG_FILE"
    echo "" >> "$CHANGELOG_FILE"
    
    # 2. Iterate through the defined categories and filter commits
    for PATTERN in "${!CATEGORIES[@]}"; do
        local HEADING="${CATEGORIES[$PATTERN]}"
        
        # Use grep -E -i to match patterns robustly (Extended Regex, case-insensitive)
        local CATEGORY_COMMITS=$(echo "$COMMITS" | grep -E -i "^${PATTERN}")

        if [ -n "$CATEGORY_COMMITS" ]; then
            echo "$HEADING" >> "$CHANGELOG_FILE"
            
            # Use sed with /I (case-insensitive) and [[:space:]]* to remove the prefix and prepend '*'
            echo "$CATEGORY_COMMITS" | sed -E "s/^${PATTERN}[[:space:]]*/* /I" >> "$CHANGELOG_FILE"
            
            echo "" >> "$CHANGELOG_FILE"
        fi
    done
}

echo "--- Starting Changelog Generation ---"
echo "Output will be saved to: $CHANGELOG_FILE"

# Initialize the Changelog file with a header
echo "# Project Changelog" > "$CHANGELOG_FILE"
echo "All notable changes to this project will be documented here." >> "$CHANGELOG_FILE"
echo "" >> "$CHANGELOG_FILE"

# 1. Collect all tags, sorted by version name (newest first)
TAGS=$(git for-each-ref --sort=-v:refname --format='%(refname:short)' refs/tags)
PREV=""
FIRST_TAG=$(echo "$TAGS" | tail -n 1)

# 2. Iterate through all tags to build the version history
echo "$TAGS" | while read CURRENT_TAG ; do
    if [ "$PREV" ]; then
        VERSION="$PREV"
        TAG_DATE=$(git log -1 --format=%ad --date=short "$PREV")
        process_commits "$CURRENT_TAG" "$PREV" "$VERSION" "$TAG_DATE" "##"
    fi
    PREV="$CURRENT_TAG"
done

# 3. Handle commits before the first tag
if [ -n "$FIRST_TAG" ]; then
    FIRST_COMMIT=$(git rev-list --max-parents=0 HEAD)
    if git log "$FIRST_COMMIT..$FIRST_TAG^" --oneline > /dev/null 2>&1; then
        process_commits "$FIRST_COMMIT" "$FIRST_TAG^" "Commits Before $FIRST_TAG" "Initial History" "##"
    fi
fi

# 4. Handle commits since the last tag (UNRELEASED)
LAST_TAG="$PREV"

if [ -n "$LAST_TAG" ] && ! git describe --tags --exact-match HEAD > /dev/null 2>&1; then
    process_commits "$LAST_TAG" "HEAD" "Unreleased" "$(date +%Y-%m-%d)" "##"
fi

echo "--- Changelog Generation Complete ---"
echo "File updated successfully: $CHANGELOG_FILE"