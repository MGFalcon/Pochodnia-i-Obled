import json, re, sys
src = 'src/'
css = open(src+'common.css',encoding='utf-8').read() + '\n' + open(src+'app.css',encoding='utf-8').read()
data = json.load(open(src+'data.json',encoding='utf-8'))
js_files = ['common.js','world.js','rules.js','portraits.js','net.js','combat.js','app.js','v_stol.js','v_hero.js','v_wyprawa.js','v_osada.js','v_mg.js','v_foes.js']
js = '\n'.join(open(src+f,encoding='utf-8').read() for f in js_files) + '\nboot();\n'
tpl = open(src+'index.tpl.html',encoding='utf-8').read()
out = tpl.replace('/*@@CSS@@*/', css).replace('/*@@DATA@@*/', json.dumps(data, ensure_ascii=False)).replace('/*@@JS@@*/', js)
import os; os.makedirs("out", exist_ok=True); open("out/stol.html",'w',encoding='utf-8').write(out)
# wersja samodzielna (własna strona): pełny dokument
full = '<!doctype html>\n<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + out.replace('<svg width="0"', '</head><body>\n<svg width="0"',1) + '\n</body></html>\n'
# move title/style into head: they come before </head> already since we inserted </head> after them
open('out/index.html','w',encoding='utf-8').write(full)
print(len(out)//1024, 'KB')
