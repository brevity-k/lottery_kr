# Traffic Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement SEO optimizations, RSS feed, mobile purchase guide, internal linking, stores map, and site-wide navigation updates to increase organic traffic.

**Architecture:** Quick-win SEO/content tasks first (Tasks 1-5), then the larger stores map feature (Tasks 6-7). All changes are static/build-time. Stores map uses Kakao Map SDK (already loaded) with pre-processed winning store data.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, Kakao Map SDK

---

## Tasks

### Task 1: SEO Keyword Optimization
Update page titles, H1s, descriptions to match high-volume Korean search queries across all feature pages.

### Task 2: RSS Feed Endpoint
Create /feed.xml route for Naver freshness signals.

### Task 3: Technical SEO
SearchAction JSON-LD, structured data on more pages, dynamic sitemap lastUpdated, font preload.

### Task 4: Mobile Lottery Purchase Guide
Blog post targeting trending keyword.

### Task 5: Internal Linking
RelatedFeatures component cross-linking all feature pages.

### Task 6: Stores Map Feature
/lotto/stores/ with winning store data and Kakao Map.

### Task 7: Navigation & Footer Updates
Add stores to nav, footer, homepage, CLAUDE.md.

## Execution Order
Tasks 1, 2, 4 can run in parallel. Task 3 after 2. Tasks 5, 6 parallel. Task 7 after 6.
