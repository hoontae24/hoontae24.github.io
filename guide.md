# POST 작성 가이드

## 폴더 구조

- `Repository Root` 아래에는 `Category` 이름으로 된 폴더가 위치한다.
- 각 카테고리 폴더 아래에 `POST 제목`으로 된 폴더가 위치한다.
- 각 POST 폴더 아래에는 `README.md`(POST), `img 폴더`(POST에 들어갈 이미지 리소스)가 위치한다.

## POST

- 각 포스트는 독립적인 글이며, 이미지 등의 자원도 독립적으로 보관함
- `README.md`:
  - 작성된 포스트 파일, Github에서 바로 읽을 수 있도록 파일 이릉을 지정
  - 파일 최상단에는 메타정보 헤더를 포함한다.(`YAML` 포맷으로 작성)
    - 필수 항목: `title`, `date`, `category`
    - 선택 항목: `description`, `tags`, `seriesId`, `thumbnail`
- `img`:
  - 이미지 리소스용 폴더
  - `README.md`에서 `./img/[img.png]`와 같이 상대경로이며 하위 경로에 위치하여 직관적으로 접근할 수 있도록 함

## Meta Data Template

---
title: "Awesome new features"
description: This is interesting features for development
date: 2022-01-15
category: category-a
tags: [tag1, tag2]
thumbnail:
---
