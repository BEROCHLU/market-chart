import pandas as pd

qq = 'spy'
qq = qq.upper()

url = f'https://finance.yahoo.com/quote/{qq}/history?p={qq}'
lst = pd.read_html(url, index_col=0, displayed_only=False)
dfHist = lst[0]
dfHist = dfHist.drop(columns=['Adj Close**', 'Volume'])

last_row = len(dfHist) - 1

dfHist = dfHist.drop(dfHist.index[[last_row]])

#strJson = dfHist.to_json()
dfHist.to_csv(f'{qq}.csv')
print(dfHist)