#!/usr/bin/env python3
"""Fabrique une copie DE TEST d'EasyProf-5.html (jamais livrée) : simule un utilisateur Firebase connecté
et ne contacte aucun serveur, pour pouvoir piloter l'app réelle avec Playwright.
Usage: python3 make_test_html.py ../../EasyProf-5.html OUT.html"""
import sys
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
a = 'const kt=UV(Cs,bt=>{f(bt);'
assert s.count(a) == 1
s = s.replace(a, 'const kt=(setTimeout(()=>{f({email:"test@example.com",uid:"u-test"});u(!1)},0),()=>{});const _unused=UV(Cs,bt=>{if(!0)return;f(bt);')
open(out, 'w', encoding='utf-8').write(s)
print('test copy ->', out)
