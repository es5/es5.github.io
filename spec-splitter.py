# vim: set fileencoding=utf-8 :

import sys
import re
from lxml import etree # requires lxml 2.0
from copy import deepcopy

# modifed copy of http://html5.googlecode.com/svn/trunk/spec-splitter

print "E55 spec splitter"

absolute_uris = False
w3c = False
use_html5lib_parser = False
use_html5lib_serialiser = False
file_args = []

for arg in sys.argv[1:]:
    if arg == '--absolute':
        absolute_uris = True
    elif arg == '--w3c':
        w3c = True
    elif arg == '--html5lib-parser':
        use_html5lib_parser = True
    elif arg == '--html5lib-serialiser':
        use_html5lib_serialiser = True
    else:
        file_args.append(arg)

if len(file_args) != 2:
    print 'Run like "python [options] spec-splitter.py index multipage"'
    print '(The directory "multipage" must already exist)'
    print
    print 'Options:'
    print '  --absolute ............. convert relative URLs to absolute (e.g. for images)'
    print '  --w3c .................. use W3C variant instead of WHATWG'
    print '  --html5lib-parser ...... use html5lib parser instead of lxml'
    print '  --html5lib-serialiser .. use html5lib serialiser instead of lxml'
    sys.exit()

if use_html5lib_parser or use_html5lib_serialiser:
    import html5lib
    import html5lib.serializer
    import html5lib.treewalkers

if w3c:
    index_page = 'Overview'
else:
    index_page = 'index'

# The document is split on all <h2> elements, plus the following specific elements
split_exceptions = [ ]


print "Parsing..."

# Parse document
if use_html5lib_parser:
    parser = html5lib.html5parser.HTMLParser(tree = html5lib.treebuilders.getTreeBuilder('lxml'))
    doc = parser.parse(open(file_args[0]), encoding='utf-8')
else:
    parser = etree.HTMLParser(encoding='utf-8')
    doc = etree.parse(open(file_args[0]), parser)

print "Splitting..."

doctitle = doc.find('.//title').text

# Absolutise some references, so the spec can be hosted elsewhere
#if absolute_uris:
#    for a in ('href', 'src'):
#        for t in ('link', 'script', 'img'):
#            for e in doc.findall('//%s[@%s]' % (t, a)):
#                if e.get(a)[0] == '/':
#                    e.set(a, 'http://www.whatwg.org' + e.get(a))
#                else:
#                    e.set(a, 'http://www.whatwg.org/specs/web-apps/current-work/' + e.get(a))

# Extract the body from the source document
original_body = doc.find('body')

# Create an empty body, for the page content to be added into later
default_body = etree.Element('body')
if original_body.get('class'): default_body.set('class', original_body.get('class'))
if original_body.get('onload'): default_body.set('onload', 'fixBrokenLink(); %s' % original_body.get('onload'))
original_body.getparent().replace(original_body, default_body)

# Extract the header, so we can reuse it in every page
header = original_body.find('.//*[@class="head"]')

# Make a stripped-down version of it
short_header = deepcopy(header)
#del short_header[2:]

# Extract the items in the TOC (remembering their nesting depth)
def extract_toc_items(items, ol, depth):
    for li in ol.iterchildren():
        for c in li.iterchildren():
            if c.tag == 'a':
                assert c.get('href')[0] == '#'
                items.append( (depth, c.get('href')[1:], c) )
            elif c.tag == 'ol':
                extract_toc_items(items, c, depth+1)
toc_items = []
extract_toc_items(toc_items, original_body.find('.//ol[@class="toc"]'), 0)

# Prepare the link-fixup script
#if not w3c:
#    link_fixup_script = etree.XML('<script src="link-fixup.js"/>')
#    doc.find('head')[-1].tail = '\n  '
#    doc.find('head').append(link_fixup_script)
#
#    link_fixup_script.tail = '\n  '

# Stuff for fixing up references:

def get_page_filename(name):
    return '%s.html' % name

# Finds all the ids and remembers which page they were on
id_pages = {}
def extract_ids(page, node):
    if node.get('id'):
        id_pages[node.get('id')] = page
    for e in node.findall('.//*[@id]'):
        id_pages[e.get('id')] = page

# Updates all the href="#id" to point to page#id
missing_warnings = set()
def fix_refs(page, node):
    for e in node.findall('.//a[@href]'):
        if e.get('href')[0] == '#':
            id = e.get('href')[1:]
            if id in id_pages:
                if id_pages[id] != page: # only do non-local links
                    e.set('href', '%s#%s' % (get_page_filename(id_pages[id]), id))
            else:
                if not id.endswith('-toc'):
                    missing_warnings.add(id)

def report_broken_refs():
    for id in sorted(missing_warnings):
        print "warning: can't find target for #%s" % id

pages = [] # for saving all the output, so fix_refs can be called in a second pass

# Iterator over the full spec's body contents
child_iter = original_body.iterchildren()

def add_class(e, cls):
    if e.get('class'):
        e.set('class', e.get('class') + ' ' + cls)
    else:
        e.set('class', cls)

# Contents/intro page:

page = deepcopy(doc)
add_class(page.getroot(), 'split index')
anno_script = etree.XML('<script src="anno.js"/>')
# append a script element for the anno script
page.getroot().append(anno_script);

page_body = page.find('body')

# Keep copying stuff from the front of the source document into this
# page, until we find the first heading that isn't class="no-toc"
for e in child_iter:
    if e.getnext().tag == 'h2' and 'no-toc' not in (e.getnext().get('class') or '').split(' '):
        page_body.append(e)
        break
    page_body.append(e)

alt_version_notice = page_body.find('.//*[@id="alt-version-notice"]')
replacement = etree.XML(u'<p id="alt-version-notice"><a href="#toc" title="skip to TOC">toc</a> · <a href="spec.html">single-page version</a> · <a href="https://github.com/es5/es5.github.com">source</a></p> ')
alt_version_notice.getparent().replace(alt_version_notice, replacement)

pages.append( (index_page, page, 'Front cover') )

# Section/subsection pages:

def should_split(e):
    if e.tag == 'h2': return True
    if e.get('id') in split_exceptions: return True
    if e.tag == 'div':
        c = e.getchildren()
        if len(c):
            if c[0].tag == 'h2': return True
            if c[0].get('id') in split_exceptions: return True
    return False

def get_heading_text_and_id(e):
    if e.tag == 'div':
        node = e.getchildren()[0]
    else:
        node = e
    title = re.sub('\s+', ' ', etree.tostring(node, encoding=unicode, method='text').strip())
    return title, node.get('id')

for heading in child_iter:
    # Handle the heading for this section
    title, name = get_heading_text_and_id(heading)
    if name == index_page: name = 'section-%s' % name
    print '  <%s> %s - %s' % (heading.tag, name, title)

    page = deepcopy(doc)
    add_class(page.getroot(), 'split chapter')

    anno_script = etree.XML('<script src="anno.js"/>')
    # append a script element for the anno script
    page.getroot().append(anno_script);

    page_body = page.find('body')

    page.find('//title').text = title + u' \u2014 ' + doctitle

    # Add the header
    page_body.append(deepcopy(short_header))

    # Add the page heading
    page_body.append(deepcopy(heading))
    extract_ids(name, heading)

    # Keep copying stuff from the source, until we reach the end of the
    # document or find a header to split on
    e = heading
    while e.getnext() is not None and not should_split(e.getnext()):
        e = child_iter.next()
        extract_ids(name, e)
        page_body.append(deepcopy(e))

    pages.append( (name, page, title) )

# Fix the links, and add some navigation:

for i in range(len(pages)):
    name, doc, title = pages[i]

    fix_refs(name, doc)

    if name == index_page: continue # don't add nav links to the TOC page

    head = doc.find('head')

    if w3c:
        nav = etree.Element('div') # HTML 4 compatibility
    else:
        nav = etree.Element('nav')
    nav.text = '\n   '
    nav.tail = '\n\n  '

    if i > 1:
        href = get_page_filename(pages[i-1][0])
        title = pages[i-1][2]
        title = title[:title.find("#")]
        a = etree.XML(u'<a href="%s">\u2190 %s</a>' % (href, title))
        a.tail = u' \u2013\n   '
        nav.append(a)
        link = etree.XML('<link href="%s" title="%s" rel="prev"/>' % (href, title))
        link.tail = '\n  '
        head.append(link)

    a = etree.XML('<a href="%s.html#contents">TOC</a>' % index_page)
    a.tail = '\n  '
    nav.append(a)
    link = etree.XML('<link href="%s.html#contents" title="TOC" rel="index"/>' % index_page)
    link.tail = '\n  '
    head.append(link)

    if i != len(pages)-1:
        href = get_page_filename(pages[i+1][0])
        title = pages[i+1][2]
        title = title[:title.find("#")]
        a = etree.XML(u'<a href="%s">%s \u2192</a>' % (href, title))
        a.tail = '\n  '
        nav.append(a)
        a.getprevious().tail = u' \u2013\n   '
        link = etree.XML('<link href="%s" title="%s" rel="next"/>' % (href, title))
        link.tail = '\n  '
        head.append(link)

    # Add a subset of the TOC to each page:

    # Find the items that are on this page
    new_toc_items = [ (d, id, e) for (d, id, e) in toc_items if id_pages[id] == name ]
    if len(new_toc_items) > 1: # don't bother if there's only one item, since it looks silly
        # Construct the new toc <ol>
        new_toc = etree.XML(u'<ol class="toc"/>')
        cur_ol = new_toc
        cur_li = None
        cur_depth = 0
        # Add each item, reconstructing the nested <ol>s and <li>s to preserve
        # the nesting depth of each item
        for (d, id, e) in new_toc_items:
            while d > cur_depth:
                if cur_li is None:
                    cur_li = etree.XML(u'<li/>')
                    cur_ol.append(cur_li)
                cur_ol = etree.XML('<ol/>')
                cur_li.append(cur_ol)
                cur_li = None
                cur_depth += 1
            while d < cur_depth:
                cur_li = cur_ol.getparent()
                cur_ol = cur_li.getparent()
                cur_depth -= 1
            cur_li = etree.XML(u'<li/>')
            cur_li.append(deepcopy(e))
            erra_marker = etree.XML(u' <b class="erra">Ⓔ</b>')
            erra_marker.tail = " "
            rev1_marker = etree.XML(u' <b class="rev1">①</b>')
            rev1_marker.tail = " "
            anno_marker = etree.XML(u' <b class="anno">Ⓐ</b>')
            anno_marker.tail = " "
            cur_li.append(erra_marker)
            cur_li.append(rev1_marker)
            cur_li.append(anno_marker)
            cur_ol.append(cur_li)
        nav.append(new_toc)

    doc.find('body').insert(1, nav) # after the header

report_broken_refs()

print "Outputting..."

# Output all the pages
for name, doc, title in pages:
    f = open('%s/%s' % (file_args[1], get_page_filename(name)), 'w')
    if w3c:
        f.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">\n')
    else:
        pass # f.write('<!DOCTYPE html>\n')
    if use_html5lib_serialiser:
        tokens = html5lib.treewalkers.getTreeWalker('lxml')(doc)
        serializer = html5lib.serializer.HTMLSerializer(quote_attr_values=True, inject_meta_charset=False)
        for text in serializer.serialize(tokens, encoding='us-ascii'):
            if text != '<!DOCTYPE html>': # some versions of lxml emit this; get rid of it if so
                f.write(text)
    else:
        f.write(etree.tostring(doc, pretty_print=False, method="html"))

# Generate the script to fix broken links
#f = open('%s/fragment-links.js' % (file_args[1]), 'w')
#links = ','.join('"%s":"%s"' % (k.replace("\\", "\\\\").replace('"', '\\"'), v) for (k,v) in id_pages.items())
#f.write('var fragment_links = { ' + re.sub(r"([^\x20-\x7f])", lambda m: "\\u%04x" % ord(m.group(1)), links) + ' };\n')
#f.write("""
#var fragid = window.location.hash.substr(1);
#if (!fragid) { /* handle section-foo.html links from the old multipage version, and broken foo.html from the new version */
#    var m = window.location.pathname.match(/\/(?:section-)?([\w\-]+)\.html/);
#    if (m) fragid = m[1];
#}
#var page = fragment_links[fragid];
#if (page) {
#    window.location.replace(page+'.html#'+fragid);
#}
#""")

print "Done."
