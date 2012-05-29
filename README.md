# Annotated ECMAScript 5

This repo holds a document that provides an annotated HTML view of ECMA 262, the
ECMAScript Language Specification (5th edition). The annotations are intended to
be collaboratively maintained.

## How to contribute annotations

If you would like to contribute annotations, here are the preferred steps:

  1. If you don’t have one already, create a [GitHub user account][1].

  2. Use the GitHub Web UI to [create your own fork of the es5-spec git
repository][2] and check it out to make a local es5-spec workspace.

  3. Create the annotation in your workspace, using the next two steps.

  4. To make an annotation for, for example, section 10.2.1.2 of the ES5
specification, create a file in the `anno` subdirectory of your local es5-spec
workspace named `x10.2.1.2.html` (note the literal `x` at the beginning of the
filename.

  5. Add your content to that file. The contents of the file should be an HTML
document fragment (not a complete document—you should omit the `html`, `head`,
and `body` elements).

  6. Add a copyright statement with your name and e-mail address to the
`anno/LICENSE.txt` file. Note that by adding a copyright statement with your
name and e-mail address to that file, you are agreeing to contribute your
annotations under the terms of the license described in that file.

  7. Commit the new annotation and updated `anno/LICENSE.txt` to your local git
repository, then push it to your GitHub es5-spec fork.

  8. Send a [GitHub es5-spec pull request][3] so that your change can be
committed into the upstream source.

   [1]: https://github.com/signup/free

   [2]: http://github.com/es5/es5.github.com#fork_box

   [3]: http://github.com/es5/es5.github.com/pulls

## Important

It is important to note that Annotated ECMAScript 5 is **not** a normative
version of the ECMAScript spec. Though it does include the **full text** of the
spec, it is in fact a completely **non-normative** derivative work _based on_
the spec—strictly for the purpose of explaining the spec and assisting in its
implementation.

![][4]

   [4]: http://es5.github.com/js-mascot.svg

Ex igne vita.

