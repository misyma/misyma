# Scraper

## Usage

```bash
Usage: scraper scrape <source> <resource> [-f num]
Options:
  -f, --from <num>  Start from this book id number
  -h, --help        display help for command
```

## Scrape E-ISBN Database

```bash
npm run start -- scrape eisbn book --from 1673848
```

## Scrape National Library API

### Books

```bash
npm run start -- scrape nationallibrary book
```

### Genres

```bash
npm run start -- scrape nationallibrary genre
```
