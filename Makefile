HTML2MARKDOWN=html2text
PYTHON=python
PYTHONFLAGS=
SPECSPLITTER=spec-splitter.py
SPECSPLITTERFLAGS=

all: index.html README.md

README.md: README.html
	$(HTML2MARKDOWN) $(HTML2MARKDOWNFLAGS) $< > $@

index.html: spec.html
	$(PYTHON)$(PYTHONFLAGS) $(SPECSPLITTER) $(SPECSPLITTERFLAGS) $< .

clean:
	$(RM) index.html
	$(RM) README.md
