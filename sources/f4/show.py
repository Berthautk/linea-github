import json,sys
for f in sys.argv[1:]:
    j=json.load(open('old/'+f+'.json'));d=j['d'];e=j.get('end',{})
    print('=====',f,'|',d.get('lesson'),'|',d.get('duration'))
    print('SIT:',' '.join(d['situation']))
    for t in j['text']:
        if t.startswith(('slide | "Situation','slide | "Answer"','slide | "Possible','slide | "Expected','slide | "Formative','slide | "Remed','slide | "Official','slide | "Homework','slide | "Teacher','slide | "Refer','slide | "Learning','slide | "Recall','slide | "Justif')): continue
        print(' ',t[:260])
    print('HW:',e.get('homework'),'|',e.get('homeworkTag'))
