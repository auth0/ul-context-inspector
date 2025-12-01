#!/bin/bash

# --- Changelog Generation Script (generate_changelog.sh) ---
# This script generates a detailed changelog (CHANGELOG.md)
# by iterating through all Git tags and logging commits between them.

# Check if we are inside a Git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: Must be run inside a Git repository."
    exit 1
fi

# Get the root directory of the Git repository
REPO_ROOT=$(git rev-parse --show-toplevel)

# Configuration
# Ensures the output file path is always the root of the repository.
CHANGELOG_FILE="$REPO_ROOT/CHANGELOG.md"

echo "--- Starting Changelog Generation ---"
echo "Output will be saved to: $CHANGELOG_FILE"

# Initialize the Changelog file with a header
echo "# Project Changelog" > "$CHANGELOG_FILE"
echo "" >> "$CHANGELOG_FILE"

# 1. Iterate through all tags, sorted by version name in reverse order (newest first).
# We use 'git for-each-ref' for reliable, version-aware sorting.
git for-each-ref --sort=-v:refname --format='%(refname)' refs/tags | while read TAG ; do
    # Only proceed if we have a previous tag to compare against (i.e., this is not the first tag)
    if [ "$PREV" ]; then
        # 2. Extract the clean version name (e.g., 'v2.0.0' from 'refs/tags/v2.0.0')
        CLEAN_VERSION="${PREV##*/}"
        
        # 3. Use 'git log' to find commits reachable from $PREV but not $TAG.
        # This gives us all commits included in the version $PREV.
        COMMIT_RANGE="$TAG...$PREV"
        
        # Check if the range is valid (i.e., there are commits to log)
        COMMIT_COUNT=$(git log "$COMMIT_RANGE" --oneline | wc -l)

        if [ "$COMMIT_COUNT" -gt 0 ]; then
            echo "--- Processing: $CLEAN_VERSION ($COMMIT_COUNT commits) ---"
            
            # Append the version header to the changelog file
            echo "## Version $CLEAN_VERSION" >> "$CHANGELOG_FILE"
            echo "---" >> "$CHANGELOG_FILE"
            
            # Append the commit list to the changelog file
            git log "$COMMIT_RANGE" \
                --pretty=format:'* %s (commit: %h, author: %an)' \
                --no-merges \
                >> "$CHANGELOG_FILE"
            
            echo "" >> "$CHANGELOG_FILE"
        else
            echo "Skipping: $CLEAN_VERSION (0 commits found)"
        fi
    fi
    
    # Set the current tag as the previous tag for the next loop iteration
    PREV="$TAG"
done

# Handle commits before the first tag (if applicable)
# Find the oldest tag
FIRST_TAG=$(git tag | sort -V | head -n 1)

if [ -n "$FIRST_TAG" ]; then
    # Log commits from the initial commit up to the first tag
    INITIAL_RANGE="HEAD...$FIRST_TAG^" # Note: Use $FIRST_TAG^ to include the commit of the tag itself

    # Find the actual commit hash of the first commit
    FIRST_COMMIT=$(git rev-list --max-parents=0 HEAD)
    
    # If the first tag is the only thing that exists, log everything up to HEAD
    if [ -z "$PREV" ]; then
        INITIAL_RANGE="$FIRST_COMMIT...HEAD"
        echo "## Initial Commit / All History" >> "$CHANGELOG_FILE"
    # If the log is currently empty, it means there was only one tag or no tags.
    elif [ "$COMMIT_COUNT" -eq 0 ]; then
        INITIAL_RANGE="$FIRST_COMMIT...HEAD"
        echo "## Initial Commit / All History" >> "$CHANGELOG_FILE"
    # Otherwise, log commits before the first tag.
    elif [ -n "$FIRST_TAG" ]; then
        INITIAL_RANGE="$FIRST_COMMIT...$FIRST_TAG"
        echo "## Commits Before First Tag ($FIRST_TAG)" >> "$CHANGELOG_FILE"
    fi

    # Log the remaining commits
    REMAINING_COMMITS=$(git log "$INITIAL_RANGE" --oneline | wc -l)
    if [ "$REMAINING_COMMITS" -gt 0 ]; then
        echo "---" >> "$CHANGELOG_FILE"
        git log "$INITIAL_RANGE" \
            --pretty=format:'* %s (commit: %h, author: %an)' \
            --no-merges \
            >> "$CHANGELOG_FILE"
        echo "" >> "$CHANGELOG_FILE"
    fi
fi


echo "--- Changelog Generation Complete ---"
echo "File updated successfully: $CHANGELOG_FILE"