
# loadr

Handling all your JS dependencies.

### Introduction

Client side JavaScript suffers from a big problem nowadays. We cannot properly build on top of each others' work. I blame it on the lack of an include feature built into JS; the only native one we have is through html script tag which didn't scale properly on it's own -- up until now.

Let me propose a solution which I feel has to potential to be the best one so far. Let alone propose, you can try out a (working prototype) version right now [over here][demo] if you are curious. Read the [quick start guide][quickStart] to get up to speed quickly.

I expect discussion from the community. Is there anything I missed? Do you have some answers to one of my [open questions][openQuestions]? [I'd love to hear from you][contact].

### Current solutions and their weeknesses

- RequireJS: many load-parse cycles makes it slow for even development
- bower: too simplistic, you still have to include everything manually via `<script>`

### Quick start guide

There are two main usecases. CDN and local installation.

#### CND

Try it out [over here][demo].

    <script src="http://load.aws.af.cm/load?packages=
      angular
      underscore
    "></script>

#### Local

    git clone git://github.com/wizek/loadr.git
    cd loadr
    npm install
    PORT=3333 node .

And you have your very own loadr. Whatever *.js you place into ./packages will be accessable through loadr.

### Open questions:

Discuss these in our [mailing list][mailingList].

- Which possible js sources should we support? Why, how? Which one should be the default? Some ideas:
  - url
  - git
  - github
  - bower
  - component
  - npm
  - local (currently implemented)
  - local, relative path
- Do you have an idea for a logo? :)

[TOC]: #toc
[demo]: http://example.com
[contact]: http://example.com
[openQuestions]: #open-questions
[quickStartGuide]: #quick-start-guide
[mailingList]: http://groups.google.com/group/loadr
