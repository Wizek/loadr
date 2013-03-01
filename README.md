# loadr

Handling all your JS dependencies -- and a little more.

### Introduction

Client side JavaScript suffers from a big problem nowadays. We cannot properly build on top of each others' work. I blame it on the lack of an include feature built into JS; the only native one we have is through html script tag which didn't scale properly on it's own -- up until now!

Let me propose a solution which I feel has the potential to be the best one so far. Let alone propose, you can try out a (working prototype) version right now [over here][demo] if you are adventurous! Read the [quick start guide][quickStartGuide] to get up to speed quickly.

I expect discussion from the community. Is there anything I missed? Do you have some answers to one of my [open questions][openQuestions]? [I'd love to hear from you][contact].

### Quick start guide

There are two main use-cases:

 - If you want to **kick-start a project** or an experiment (either locally or in a jsfiddle, [plncr][demo], etc), use the [CDN-style][cdn-style]
 - If you want to use loadr in a **production environment** or you sometimes develop without internet access, use the [local version](#local)

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

And you have your very own local loadr. Place .js files into `./packages` and they will be accessible through loadr. Folders and symlinks are OK too.

You can specify dependencies for scripts very similar to how you would `"use strict";`:

    "require path/to/my/dependency";

*Note:* the semicolon at the end is optional and is used now to characterize the above as a statement

*Note:* The path is relative to `loadr/packages`

Let's suppose you place `my1.js`, `folder/my2.js` and `folder/my3.js` into `./packages`.
You can reqire them like this:
- `"require my1"` - loads `my1.js`
- `"require folder/my2"`- loads `folder/my2.js`
- `"require folder/"`- loads direct JS children of `folder/`, in this case `my2.js` and `my3.js`

...And of course, all of their dependencies are also loaded!


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

### Vision

As the saying goes, this is only the tip of the iceberg. There are a lot of features and extensions to be added in the near future. And their order and details depend greatly on your [early feedback][contact].

**Imagine this:** You have a great idea, and want to jump into experimenting with it as soon as possible. You know you'll need some sort of sortable or drag'n'drop functionality. You go to loadr's discovery site where you input "sortable drag and drop". Results return quickly ordered based on a sophisticated relevance score -- which takes into account among others the popularity, the maintained-ness, the the alternative-graph of the results.

You click the first one and quickly see that in the alternative list (much like at [alternativeto.net](http://alternativeto.net)) that there is a jquery-ui/sortable which might be a little outdated at this point (because all the modern libs are now properly componentialized and don't depend on monolithic libraries such as jQuery) you are at least familiar with it's API. Yay for backwards compatibility! (Yes, if it works with a script tag, it works with loadr. Out of the box.)

### What makes loadr different from...

- **RequireJS/AMD**: many load-parse cycles makes them slow even for development wasting a vast amount of time waiting for network.
- **bower**: too simplistic, you still have to include everything manually via lots of script tags
- **component**: This one is pretty close, but let's see: no per-project buld step required.

  You just set up the local version to be a daemon and you can forget about it. No more `cd project; watch make &` every time you resume work. To use [loadr CDN style][cdn-style] you don't even have to install or run anything, just include the single script tag.

[TOC]: #toc
[demo]: http://plnkr.co/edit/WYRqk7T928iuCp3RYWvw?p=preview
[contact]: http://example.com
[openQuestions]: #open-questions
[quickStartGuide]: #quick-start-guide
[mailingList]: http://groups.google.com/group/loadr
[cdn-style]: #cdn
