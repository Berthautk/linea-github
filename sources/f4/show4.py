import json,sys
for f in sys.argv[1:]:
    j=json.load(open('old/'+f+'.json'));e=j['end'];sp=j.get('sp',e)
    print('=====',f,'|',e['lesson'])
    print('SIT:',' '.join(e['situation'])[:300])
    for p in sp['parts']:
        print(' #',p['sec'])
        for x in p['qa']: print('   Q:',x['q'][:140], '| img:'+x['img'] if x.get('img') else '')
        s=p['sum'];print('   S:',s['title'],'||',' ; '.join((i[0]+': '+(i[1] if isinstance(i[1],str) else ' '.join(i[1])))[:90] for i in s.get('items',[])))
