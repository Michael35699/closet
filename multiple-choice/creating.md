---
layout: doc
title: Creating multiple choice
nav_order: 1
permalink: multiple-choice/creating
parent: Multiple Choice
---

{% assign b='Frontside, q, {"side": "front"}, true; Backside, a, {"side": "back"}, true' %}
{% assign bOneTwo='Frontside 1, q1, {side: "front",card: "c1"}, true; Backside 1, a1, {side: "back",card: "c1"}, true; Frontside 2, q2, {side: "front",card: "c2"}, true; Backside 2, a2, {side: "back",card: "c2"}, true' %}
{% assign bOneTwoThree='F1, q1, {side: "front",card: "c1"}, true; B1, a1, {side: "back",card: "c1"}, true; F2, q2, {side: "front",card: "c2"}, true; B2, a2, {side: "back",card: "c2"}, true; F3, q3, {side: "front",card: "c3"}, true; B3, a3, {side: "back",card: "c3"}, true' %}

{% assign mc = site.data.snippets.multiple_choice %}
{% assign setups = site.data.setups %}

{% include toc-doc.md %}


## Creating multiple choice

{% include codeDisplay.md content=mc.simple filterManager=setups.default_multiple_choice buttons=b %}

Bla Bla Bla

{% include codeDisplay.md content=mc.simple filterManager=setups.fancy_multiple_choice buttons=b %}