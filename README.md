# loadr

Handling all your JS dependencies -- and a little more.

### Try it out *[over here!][demo]*

## Vision

As the saying goes, this is only the tip of the iceberg.
That is, the stuff that already works and is written about in the [quick start guide][quickStartGuide].
There are a lot of features and extensions to be added in the near future. And their order and details depend greatly on your [early feedback][contact].

**Imagine this:** You have a great idea, and want to jump into experimenting with it as soon as possible.
You know you'll need some sort of sortable or drag'n'drop functionality.
You go to loadr's discovery site where you input "sortable drag and drop".
Results return quickly ordered based on a sophisticated relevance score
-- which takes into account among others the popularity, the maintained-ness, the the alternative-graph of the results.

You click the first one.
In the alternative list (like at [alternativeto.net](http://alternativeto.net)) there is a `jquery-ui/sortable`.
It might be considered a little outdated at this point
*(because all the modern libs are now properly componentialized and don't depend on monolithic libraries such as jQuery)*
but at least you are familiar with it's API.
Yay for backwards compatibility!
*(Yes, if it works with a script tag, it works with loadr as well. Out of the box.)*

Armed with the new knowledge, you create `idea.html` with

    <!doctype html>
    <script src="http://loadr.aws.af.cm/load?packages=
      jquery-ui/sortable
      underscore
    "></script>
    <script>
      // Here starts everything
    </script>

And it might just be the humble begining of your most awesome project so far.



## Introduction

Client side JavaScript suffers from a big problem nowadays.
We cannot properly build on top of each others' work.
I blame it on the lack of an include feature built into JS;
the only native one we have is through html script tag which didn't scale properly on it's own -- up until now!

Let me propose a solution which I feel has the potential to be the best one so far.
Let alone propose, you can try out a (working prototype) version right now [over here][demo] if you are adventurous!
Read the [quick start guide][quickStartGuide] to get up to speed quickly.

I expect discussion from the community.
Is there anything I missed?
Do you have some answers to one of my [open questions][openQuestions]?
[I'd love to hear from you][contact].



### Quick start guide

There are two main use-cases:

- If you want to **kick-start a project** or an experiment
  (either locally or in a jsfiddle, [plncr][demo], etc), use the [CDN-style][cdn-style]
- If you want to use loadr in a **production environment** or
  you sometimes do development offline, use the [local version](#local)




#### CDN

***Try it out [over here][demo]***.

    <script src="http://loadr.aws.af.cm/load?packages=
      angular
      underscore
    "></script>

It's a regular HTML script tag. The magic is in the path: `http://loadr.aws.af.cm/load?packages=`
Write your desired modules after `packages=` separated by whitespace and/or comma, or as we say in regex-speak: `[\s,]+`

Some examples of valid uses:

    <script src="http://loadr.aws.af.cm/load?packages=angular underscore"></script>

    <script src="http://loadr.aws.af.cm/load?packages=angular,underscore"></script>

    <script src="http://loadr.aws.af.cm/load?packages=angular, underscore"></script>

    <script src="http://loadr.aws.af.cm/load?packages=
      angular
      underscore
    "></script>

    <script src="http://loadr.aws.af.cm/load?packages=
      angular,
      underscore
    "></script>

    <script src="http://loadr.aws.af.cm/load?packages=
      , angular
      , underscore
    "></script>

Personally I prefer the second one for short list and fourth one for longer lists but it's your choice.



#### Local

    git clone git://github.com/wizek/loadr.git
    cd loadr
    npm install
    PORT=3333 node .

And you have your very own local loadr. Place .js files into `./packages` and they will be accessible through loadr. Folders and symlinks are OK too.

You can specify dependencies placed in there for scripts very similar to how you would `"use strict";`:

    "require path/to/my/dependency";

*Note:* the semicolon at the end is optional and is used now to emphasize the above as being a statement

*Note:* The path is relative to `loadr/packages`

Let's suppose you place `foo.js`, `folder/bar.js` and `folder/baz.js` into `./packages`.
You can reqire them like this:
- `"require foo"` - loads `foo.js`
- `"require folder/bar"`- loads `folder/bar.js`
- `"require folder/"`- loads direct JS children of `folder/`, in this case `bar.js` and `baz.js`

...And of course, all of their dependencies are also loaded!

How would you make `foo` dependent on `bar` and `baz`?

Either:

    "require folder/bar";
    "require folder/baz";

Or more concisely:

    "require folder/";




## Open questions:

Come and discuss these in our [mailing list][mailingList]. You are warm heartedly welcome there.

- Which possible js sources should we support? Why, how? Which one should be the default? Some ideas:
  - local (currently implemented)
  - local, relative path
  - url
  - git
  - github
  - bower
  - component
  - npm
- Do you have an idea for a logo? :)




## What makes loadr different from...

- **RequireJS/AMD**: Many load-parse cycles makes this approach slow even for development. Wasting vast amounts of time waiting for network is no fun.

- **bower**: Too simplistic. You still have to include everything manually via lots of script tags.

- **component**: This one is pretty close, but let's see: no per-project build step required.

  You just set up the local version to be a daemon/service and you can forget all about it.
  No more `cd project; watch make &` every time you resume work.
  That rings a bell, doesn't it? :)

  Even better:
  to use loadr [CDN style][cdn-style] you don't even have to install or run anything,
  just include the single "magical" script tag and you are all set!





## License

MIT




[TOC]: #toc
[demo]: http://plnkr.co/edit/WYRqk7T928iuCp3RYWvw?p=preview
[contact]: http://example.com
[openQuestions]: #open-questions
[quickStartGuide]: #quick-start-guide
[mailingList]: http://groups.google.com/group/loadr
[cdn-style]: #cdn
