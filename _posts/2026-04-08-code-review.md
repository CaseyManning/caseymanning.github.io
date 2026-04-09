---
layout: post-serif
title: "notes on rolling my own ai code review"
date: 2026-04-08
hidden: true
---

I just finished about a year at a small startup, with ~2-3 people doing software development at any given time. I wanted to set up ai code review for us, but when I looked about a year ago, most of the options available seemed to operate on strictly pr-based workflow, and since we were at a size where everyone mostly just pushed to main, it seemed like the best thing to do was just set up a slackbot. What I ended up with was super simple, but I thought I'd write up a few considerations and things I tried along the way.

![code review bot](/postimages/reviews.png)

The basic setup is likely exactly what you'd expect:
- We have a `#code-review` channel in slack, with a bot (claudey) that posts to it
- A github action runs on every commit on every branch (except deployment branches which will have already been reviewed) and runs a headless claude code session with the diff and asks it to review
- Claude is instructed to add a special string to its final message (`[needs review]`) which causes the stripped final message to be sent to slack. Likely you are supposed to do this with tool calls but i didn't bother somehow.

My prompting was pretty barebones, most of the work went into trying to emphasize all the different things it shouldn't bother telling us about, as by default it was really noisy and would try to come up with issues for nearly every commit. This setup provided enormous amounts of value, so many problems would have been deployed without it (not to mention typos, which it was also great for finding). 

### Shared review channel mechanics

Because of the small number of people, I just hardcoded a github username -> slack user id mapping in the github action, so that the message could @mention the correct person. I thought about having each person just get their own code reviews via direct message, but I actually found I got a lot of value skimming through every code review to see if anything funky was happening or walk over to someone's desk if it looked like they were going to run into something hairy that I could help with. Clearly this wouldn't work for 6 or 8 engineers, but I could imagine getting a lot of value out of being able to skim the review output of 3-5 relevant engineers in a slack channel at a larger company. (though likely code review messages aren't actually the correct type of information to see about other peoples work, and you could construct a second summary message stream that would be more informative for others)

### Combining reviews

Based on [this cursor blog](https://cursor.com/blog/building-bugbot) which has a much better writeup than I'll include here, I updated the github action to run both codex and claude code on the diff, and then combine the found issues together. I first ran the two in parallel and had them both output their own review message to see the difference, and found that they did actually pretty frequently come up with separate but both useful feedback, so I think this is definitely a win.

### Codebase deep links

A friction point I encountered early on was every time the slack message would mention a line, and I would need to spend 20 seconds opening up the file in my editor and finding the line it was talking about. It turns out I didn't need to do this, as I could just link directly to the files/lines! It was a little finicky at times, but I could:

- prompt claude code / codex in the job to include full file paths in their final review messages
- have a step after the reviews are outputted that asks an llm to replace all file paths with a cursor deep link for that file and line number
- be able to click any line the review mentions and have it show up immediately in my IDE

![cursor deep links](/postimages/link.png)

This was really great for being able to interact with reviews. My version did require hardcoding the full filepath of the codebase for each user who wanted deep links (so the deep link could be `/my/specific/path/to/codebase` which cursor seemed to require), but I feel like there must be some way to get around this.

### Autofixes

Since a common workflow for me was: ask claude to implement something -> push it -> get a review from claude -> send that back to the first claude to fix -> push again, it felt like I could save myself some copy pasting by just having the claude code that was doing the review also just fix the issue itself.

After coming up with issues, I had claude classify them as "easily fixable" vs. "requires substantial decision-making" and generate a fix for issues of the former category, push them to a new branch (`auto-fix-xxxx`) and make a new pr for merging that branch. Each review then had a button which would take you to the open pr:

![view fix button](/postimages/viewfix.png)

This seemed cool, but in practice I basically never used it. Most of the fixes of this category took little enough time to do locally (and I often already had a claude session open preloaded with all the relevant context) that it just seemed easier than looking at the fix, and the premade pr was somehow still too high friction. I ended up removing the fixes feature. My theory is this was mainly because you couldn't *see* the fix in the message. Clicking through was too much of a mystery, but if the proposed diff was right there in the message, I might have been a lot more enthusiastic about just clicking merge if it immediately seemed right. I worry about bloating the size of messages / making them too hard to read, but it might be worth doing (including the diff as a thread reply to the slack message might be a nice medium?) I would need to experiment more.

### Usage

Doing this was really cheap. When I first set it up I didn't realize I could use my subscription OAuth token for the code reviews so was paying a decent amount in api costs, but after realizing that, I just hooked it up to the same $100/mo plan that I used for personal claude code usage, and never ran out. I would likely have needed a pool of subscriptions if we hired too many more people, but the costs seem like they would never get that high unless you're making crazy numbers of commits, which some people definitely do.

### Things I want

There are definitely a lot of things that could make this even more useful. I'm would be excited about getting a version of this that runs on a machine with a dev server and can do end to end web app testing via claude in chrome as part of the review process. It also feels like it would be better for reviews to be much more tightly integrated with the coding agent workflow: both me and the other SWEs ended up often just preemptively pushing things before testing just so we could see the claudey review. It seems like one easy setup improvement would having a tool call to allow claude code to get the same review piped back directly to it while it's writing or when it finishes. Review on commit worked for us given how small we were, but it definitely is far from ideal.

Likely there are services that do all of this for you in a much better way.