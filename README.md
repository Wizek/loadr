# loadr

Handling all your JS dependencies -- and a little more.

### Introduction

Client side JavaScript suffers from a big problem nowadays. We cannot properly build on top of each others' work. I blame it on the lack of an include feature built into JS; the only native one we have is through html script tag which didn't scale properly on it's own -- up until now.

Let me propose a solution which I feel has to potential to be the best one so far. Let alone propose, you can try out a (working prototype) version right now [over here][demo] if you are curious. Read the [quick start guide][quickStart] to get up to speed quickly.

I expect discussion from the community. Is there anything I missed? Do you have some answers to one of my [open questions][openQuestions]? [I'd love to hear from you][contact].

### Current solutions and their weeknesses

- RequireJS: many load-parse cycles makes it slow even for development
- bower: too simplistic, you still have to include everything manually via lots of script tags

### Quick start guide

There are two main use-cases. [CDN-style](#CDN) and [local installation](#local).

 - If you want to kick-start a project or an experiment (either locally or in a jsfiddle, [plncr][demo], etc), use the [CDN-style](#CDN)
 - If you want to use loadr in a production environment or without internet access, use the [local version](#local)

#### CDN

Try it out [over here][demo].

    <script src="http://load.aws.af.cm/load?packages=
      angular
      underscore
    "></script>

It's a regular HTML script tag. The magic is in the path: `http://load.aws.af.cm/load?packages=`

#### Local

    git clone git://github.com/wizek/loadr.git
    cd loadr
    npm install
    PORT=3333 node .

And you have your very own local loadr. Place .js files into `./packages` and they will be accessable through loadr.

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
