# AGENTS.md

## Project Overview

This repository contains the `arcfort-website` project for ARCFORT Welding & Cutting Solutions, an industrial welding and cutting brand website.

## Development Guidelines

- Use Next.js App Router patterns under `app/`.
- Keep shared layout elements in `components/`.
- Keep structured product/category content in `lib/`.
- Use TypeScript for all application code.
- Use TailwindCSS utility classes for styling.
- Keep the visual direction industrial, clean, responsive, and blue-led with restrained signal accents.
- Do not commit real secrets, API keys, credentials, or private customer data.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run format
```

## Pages

- `/`
- `/products`
- `/about`
- `/contact`
- `/rfq`

## Before Handoff

- Run `npm run lint` when dependencies are installed.
- Run `npm run build` before opening a pull request.
- Confirm that contact details and RFQ handling are production-ready before launch.
