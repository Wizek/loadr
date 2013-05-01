Handling all your JS dependencies for kick-starting your projects — and a *little* more.





## Live demo
- [simple][simpleDemo]
- [advanced][demo]





## Introduction

Client side JavaScript suffers from a big problem nowadays.
We cannot properly build on top of each others' work.
I blame it on the lack of an include feature built into JS;
the only native one we have is through html script tag
which didn't scale properly on it's own — up until now!

Let me propose a solution which I feel has the potential to be the best one so
far. Let alone propose, you can try out a working version right now
[over here][simpleDemo] if you feel adventurous!

Read the [quick start guide][quickStartGuide] to get up to speed quickly.

I expect discussion from the community.
Is there anything I missed?
Do you have some answers to one of my [open questions][openQuestions]?
[I'd love to hear from you][contact].





### Quick start guide

There are two main use-cases:

- If you want to **kick-start a project** or **start an experiment quickly**
  (either locally or in a jsfiddle, [plnkr][simpleDemo], etc), use the [CDN-style][cdn-style]
- If you want to use loadr in a **production environment** or
  you need the ability to **develop offline**, use the [local version](#local-install)

As the saying goes, this is only the tip of the iceberg. That is, the stuff that
already works and is written about in this the quick start guide is just the
beginning. Read the [The Vision][vision] or [The Future][future] to get a
glimpse. There are a lot of features to be added in the near future. Their
order and details depend greatly on your [early][openQuestions]
[feedback][contact].





#### CDN

**Try it out online [*over here*][simpleDemo]**.

    <script src="http://loadr.aws.af.cm/load?packages=
      angular
      underscore
    "></script>

It's a regular HTML script tag.
The magic is in the path:

    http://loadr.aws.af.cm/load?packages= dep1 dep2

Write your desired modules after `packages=` separated by whitespace and/or comma.
Or as we say in regex-speak: `[\s,]+`

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

Personally I prefer the second one for short lists and
the fourth one for longer lists. But it's your choice.

Current list of available scripts from the cdn for the sake of this prototype:

- angular
- angular-ui
- backbone
- c
- f1
- f2
- ifPattern
- jquery
- jquery-ui
- moment
- ticker
- underscore

*Note:*
This list will be greatly extended once we figure out the
[open question about the default source-registry][openQuestions].
The domain or path may also change once a conclusion is reached.
If there is a lib you'd like to add to the current CDN to maximize
your experimenting experience, [get in touch][contact].

In addition, you can ask loadr to tell you the full dependency tree of given
packages simply by changing `/load?` to `/deps?` in the path like so :

    http://loadr.aws.af.cm/deps?packages=backbone, jquery

This yields:

    [
      {
        "backbone": [
          {
            "underscore": []
          }
        ]
      },
      {
        "jquery": []
      }
    ]

Note: This is an experimental feature which I found useful for debugging.

Would you like to use this output programmatically on the client side? [Reach
out to us][contact] and/or submit a pull request  as it could easily be made
JSONP compatible to avoid cross domain restrictions.

##### Non-local protocols

Since 0.2.0 loadr supports http(s):// and github:// protocols. (npm:// and
bower:// will follow) This is how you can make loadr to go out and fetch JS
for you from the WWW:

http://loadr.aws.af.cm/load?packages=github://loadr/angular

Or:

http://loadr.aws.af.cm/load?packages=http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js

Have a look at what happens behind the curtains:

http://loadr.aws.af.cm/deps?packages=github://loadr/angular

See, it desugares to an HTTP link pointing to raw.github.com, which requires
another HTTP link. Clever, eh? ^^ With this knowledge you too can publish JS
files **with full dependency management using only GitHub**. Nothing else is
needed.


##### Caching

Since 0.3.0 loadr caches source files (local, github:// and http(s):// as well)
into memory. You can have a look into its current state by visiting:

http://loadr.aws.af.cm/cache



#### Local install

You'll need: git, npm and nodejs.

    git clone https://github.com/Wizek/loadr.git
    cd loadr
    npm install
    PORT=3333 node .

You can also run the tests by running `jasmine-node spec/`.

And you have your very own local loadr. Place .js files into `./packages` and they will be accessible through loadr. Folders and symlinks are OK too.

*Tip:* I use symlinks to point `./packages/projectName/` to `/path/to/projetName/src/js/` so I can use loadr to manage project-specific dependencies as well.

You can specify dependencies placed in there for scripts very similar to how you would `"use strict";`

    "require path/to/my/dependency";

    void function ($) {
      /* Such code comes here that depend on `path/to/my/dependency` */
    }(dependency)

*Note:* the semicolon at the end is optional and is used now to visually emphasize the above as being a statement

*Note:* The path is relative to `./packages` folder within your cloned loadr folder.


Let's suppose you place `foo.js`, `folder/bar.js` and `folder/baz.js` into `./packages`.
You can reqire them like this:
- `foo` - loads `foo.js`
- `folder/bar`- loads `folder/bar.js`
- `folder/`- loads direct JS children of `folder/`, in this case `bar.js` and `baz.js`

...And of course, all of their dependencies are also loaded!

How would you make `foo` dependent on `bar` and `baz`?

Prepend `foo.js` with either:

    "require folder/bar";
    "require folder/baz";

Or more concisely:

    "require folder/";

Once you have loadr running locally and some scripts in `./packages`, you can
use them like you would the cdn way, just with the different domain and port:

    <script src="http://localhost:3333/load?packages=
      foo
      folder/
    "></script>

*Note:* [lean more about the CDN-style][cdn-style] for more information on how
to use loadr once you have your local version set up.





## What makes loadr different from...

- **bower**:
  You still have to include everything manually via lots of script tags or fall back to AMD. Therefore doesn't encourage much needed componentialization of libraries.

- **RequireJS and other AMD**:
  Many load-parse cycles makes this approach slow even for development.

  Wasting vast amounts of time waiting for network is no fun.

- **component**: This one is pretty close, but let's see:

  You just set up a local loadr to be a daemon/service and you can forget all about it.
  No more `cd project; watch make &` every time you resume work in one of your projects.
  That rings a bell, doesn't it? :)

  Even better:
  to use loadr [CDN style][cdn-style] you don't even have to install or run anything,
  just include the single "magical" script tag and you are all set!





# The future

## Coming soon (aka TODO)

There are a number of features we can have further along the line:


- Online platform to register and manage your published libs.

  Might not be needed if we opt for github, bower or component for registry as mentioned in the [open questions][openQuestions] section.


- Discovery platform for loadr libs.

  As mentioned in the [vision](#vision).


- 'Negative loading' to support deferred scripts and reduced initial payload.

  Something similar to what is mentioned in [this talk](http://www.youtube.com/watch?v=mGENRKrdoGY).


- Semantic version handling.

  Something like what is described in [this npm doc](https://npmjs.org/doc/json.html#dependencies).


- Progress bar.

  If you specify an external source for loadr,
  you will be presented with a progress bar and
  the page will auto-refresh once complete.
  This featuer will ensure that you won't have to use a command line interface to use loadr, everything is taken care of for you, right when you need it.


- Universal packages.

  Something like `"require npm://underscore"` for those that would work in the browser too.




## Open questions

I'd love to have some participation of the community to help decide with these
questions and shape loadr to become most of what it can. Loadr will be the most
successful if there is an awesome and supportive community behind it, who
consist of people sharing our [long term goals](#the-future), [vision][vision],
and passion. :)

Come and discuss these in our [mailing list][mailingList].
You are warm heartedly welcome there.


- Which possible js source registries should we support?
  Why, how? Which one should be the default? Some ideas:

        local (currently implemented)
        local, relative path
        url
        git
        github
        bower
        component
        something else?


- What should be the syntax of requiring modules?
  (Some yet-to-be-implemented) examples:

        "require github://name/repo";
        "require name/module";
        "require /folder/file";
        "require ./folder/file";
        "require file";
        "require file@0.0.1";
        "require npm://name";
        "require http://example.com/path/to/file.js";
        something else?


- How should we address caching?
  This question is two-fold:

    - In the case of the CDN caching by the browsers.
    - In the case of an external source (such as a git url) caching by loadr itself so that it doesn't do excess networking.


- Do you have an idea for a loadr logo? :)


- If we decide to support npm packages, how are we going to do it?
  What will we do with those that require node-specific api (like fs)?

- Would loadr make sense for CSS? How?
  If so, should we include support for Stylus, Less, Sass, etc? How do you imagine we do that?

- Would loadr make sense for HTML templates? How? Some libs will need templates
(think a datepicker) and it is quite inconvinient to write html in js strings.

- How could we ease debugging? Source maps?

- (How) Should we support languages that compile to js, like CoffeeScript?

- (How) Should we enable commonjs (or some other module definition) support?

    - `(+)` Better than polluting the global namespace.
    - `(-)` Backwards incompatible, breaking change.
    - `(?)` Let libraries decide?

        Compare:

        ```
        "require commonjs"
        var exports = {a: require('foobar')}
        export('name', exports)
        ```

        With:

        ```
        "require angular"
        angular.module('name', ['foobar'])
        .factory('a', function(foobar_a){return fobar_a})
        ```

        - `(+)` Greater choice with the developer, space for innovation.
        - `(-)` Might lead to fragmentation of the library ecosystem:
        "I need to include the whole of angular just to get this simple lib".

            - `(+0.5)` While that might be an issue right now, it will be
            mitigated once libs are correctly modularized and you can write
            `"require angular/dependency-injector"` istead of
            `"require angular"`.







## Vision

**Imagine this:** You have a great idea, and want to jump into experimenting with it as soon as possible.
You know you'll need some sort of sortable or drag'n'drop functionality.
You go to loadr's discovery site where you input "sortable drag and drop".
Results return quickly ordered based on a sophisticated relevance score
— which takes into account among others the features, the popularity, the "maintained-ness", the the alternative-graph of the results.

You click the first one.
In the alternative list *(like at [alternativeto.net](http://alternativeto.net))* there is `jquery-ui/sortable`.
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

    <script> /* Here starts everything */ </script>

And it might just be the humble beginning of your most awesome project so far.








## Contact

For ([open][openQuestions]?) questions and general discussion you are most welcome to our [Google Group][mailingList].

Bugs and issues should be reported [here](https://github.com/Wizek/loadr/issues).

You can also reach me through direct email if you so desire: <123.wizek+loadr@gmail.com>




## License

(The MIT License)

Copyright (c) 2013 Milán Nagy <123.wizek+loadr@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.




[TOC]: #toc
[demo]: http://plnkr.co/edit/WYRqk7T928iuCp3RYWvw?p=preview
[simpleDemo]: http://plnkr.co/edit/RugNn8?p=preview
[contact]: #contact
[vision]: #vision
[future]: #the-future
[openQuestions]: #open-questions
[quickStartGuide]: #quick-start-guide
[mailingList]: http://groups.google.com/group/loadr
[cdn-style]: #cdn
