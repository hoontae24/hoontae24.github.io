---
title: 자주 사용하는 Git 명령어 정리
description:
date: 2020-03-08
category: git
tags: [git]
---

![git](./img/git.png)

Git은 개발자들이 버전 관리 도구로 많이 사용하고 있습니다. 사용하기도 쉽고, Github과 연동하면 소스 코드를 관리하기도 편리합니다. 이번 포스트에서는 Git을 사용할 때, 자주 사용하는 명령어를 정리해보도록 하겠습니다.

_(단, git의 명령어의 개념과 명령어의 모든 옵션을 다루지 않습니다. 개인적으로 자주 사용하는 것들만 다루도록 하겠습니다.)_

---

#### Init

```shell
$ git init
```

`init`은 Git 저장소를 초기화하는 명령어입니다. 프로젝트에서 Git을 사용하려면 `git init`을 통해서 저장소를 초기화하거나, `git clone`을 이용하여 저장소를 불러와야합니다.

#### Clone

```shell
$ git clone <repository> [<directory>]
```

위에서 언급하였듯이, `git clone`은 이미 저장된 저장소를 불러오는 명령어입니다. 주로 Github에 있는 저장소를 불러와 복제할 때 이용합니다.

```shell
# github 저장소 clone하기
# <directory>를 지정하지 않으면 새로운 폴더를 생성함
$ git clone https://github.com/<github_username>/<repository_name>.git

# github 저장소 clone하기
# 현재 위치의 폴더에 clone함
$ git clone https://github.com/<github_username>/<repository_name>.git ./

# github 저장소 clone하기
# my_project 폴더에 clone함
$ git clone https://github.com/<github_username>/<repository_name>.git my_project

# 로컬 저장소 clone하기
$ git clone ./other_project/.git ./other_project_2
```

#### Status

```shell
$ git status
```

git 저장소가 생성되면, 프로젝트의 파일 변경을 감지합니다. `git status`로 변경된 파일이 무엇인지 알 수 있습니다. 또한 해당 파일들을 어떤 index로 관리하고 있는지 표시해줍니다.

#### Add

```shell
$ git add <file>
```

`git add`로 추가된 파일은 staged index로 관리합니다. staged 상태의 파일은 커밋 대상이 됩니다.

```shell
# 프로젝트의 모든 변경된 파일을 staged 상태로 등록합니다.
$ git add .
```

#### Commit

```shell
$ git commit [-m <commit_message>]
```

현재 staged 상태 파일들의 버전을 저장합니다. commit은 파일의 변경 사항들을 저장하고 hash로 commit_id를 남깁니다.

```shell
# message를 작성하는 화면에서 추가 작업 후 commit됨
$ git commit


# 메시지를 포함하여 즉시 commit됨
$ git commit -m "initial commit"
```

#### Log

```shell
$ git log [<branch_name>]
```

저장소의 commit 내역을 확인합니다.

#### Diff

```shell
$ git diff [<commit>] [<target_commit>]
```

commit 내용의 변경 내역을 보여줍니다. \<commit>에는 commit_hash나 branch_name이 올 수도 있습니다.

```shell
# 현재 커밋에서 변경된 부분을 보여줌
$ git diff --stat

# 현재 커밋과 "develop" branch의 변경 사항을 보여줌
$ git diff --stat develop

# "release" branch와 "develop" branch의 변경 사항을 보여줌
$ git diff --stat develop release
```

#### Branch

```shell
$ git branch [<new_branch_name>] [-a] [-r] [-d,-D <branch_name>]
```

```shell
# 로컬 저장소의 branch 목록을 보여줌
$ git branch

# 원격 저장소의 branch 목록을 보여줌
$ git branch -r

# 모든 branch 목록을 보여줌
$ git branch -a

# 현재 커밋에 새로운 branch "develop"을 생성함
$ git branch develop

# "master" branch 커밋에 새로운 branch "develop"을 생성함
$ git branch develop master

# "develop" branch를 삭제함(merge되었을 경우에만)
$ git branch -d develop

# "develop" branch를 삭제함(강제 삭제)
$ git branch -D develop
```

#### Checkout

```shell
# 버전(Head)을 "develop" branch로 이동
$ git checkout develop

# "develop" branch를 생성하고, 이동
$ git checkout -b develop
```

#### Merge

```shell
$ git merge <branch_name> [--no-ff] [--squash]
```

```shell
# 현재 branch에 develop branch를 병합
$ git merge develop

# fast-forward 없이 병합
$ git merge develop --no-ff

# "develop" branch의 병합할 commit을 합쳐서 staged로 가져옴
$ git merge develop --squash
```

#### Rebase

```shell
# 현재 branch를 "develop" branch에서 시작하도록 이동
$ git rebase develop

# 마지막 5개의 커밋을 수정
$ git rebase -i head~5
```

#### Stash

```shell
# 커밋되지 않은 변경된 내용을 따로 저장(Untracked 파일을 제외)
$ git stash

# stash 한 내용을 다시 적용하고, stash에서 삭제
$ git stash pop
```

#### Reset

```shell
# 마지막 2개의 커밋을 되돌리고 변경 내용은 유지
$ git reset head~2

# 마지막 2개의 커밋을 되돌리고 변경 내용은 삭제
$ git reset head~2 --hard

# 현재 커밋에서 변경된 내용을 삭제
$ git reset --hard
```

#### Remote

```shell
$ git remote add <remote_name> <remote_url>

# url의 저장소를 origin 원격 저장소로 추가
$ git remote add origin https://hoontae24.github.com/hoontae24.github.io.git
```

#### Fetch

```shell
# 현재 branch의 원격 저장소 버전을 불러옴
$ git fetch

# origin 원격 저장소의 develop branch를 불러옴
$ git fetch origin develop
```

#### Pull

```shell
# 현재 branch에 원격 저장소 버전을 덮어씀(fetch + merge)
$ git pull
```

#### Push

```shell
# origin 원격 저장소에 develop branch 버전을 저장함
$ git push origin develop
```

#### Config

```shell
# 현재 저장소의 config 정보를 불러옴
$ git config --list

# 전역 저장소의 config 정보를 불러옴
$ git config --list --global

# 현재 저장소의 username을 불러옴
$ git config user.name

# 현재 저장소의 email을 불러옴
$ git config user.email

# 현재 저장소의 username을 등록(수정)함
$ git config user.name "hoontae24"

# 현재 저장소에 git 명령어 별칭(alias)을 등록함
$ git config alias.<alias_name> "command"

# develop branch로 checkout하는 명령어를 alias로 등록
$ git config alias.dev "checkout develop"
$ git dev # git checkout develop
```

---

#### 마무리

이번 포스트에서는 제가 개인적으로 자주 사용하는 Git 명령어를 정리해보았습니다. git을 사용하면서 아직도 모르는 기능이 많이 있는데, 명령어에 대해 자세히 몰라도 어떤 명령어가 있는지 대충 기억하기만 하면 검색하여 이용할 수 있으니 이렇게 정리해둡니다.

이 포스트는 명령어를 정리하여 기억하기 위한 용도이니 사실 git을 배우거나 개념을 익히기에는 설명이 너무 부족합니다. 다음에는 기본적인 git 명령어를 가지고 실습해보는 법을 알아보도록 하겠습니다.
