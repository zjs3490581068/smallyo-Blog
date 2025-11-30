---
title: "Python数据分析-series"
categories: Study
tags: ['Python']
id: "c498296d035f0a0d"
date: 2025-11-30 21:45:30
cover: "https://zycs-img-2lg.pages.dev/v2/5jZVE7h.png"
---

# 创建方法


```python
import pandas as pd
import numpy as np
```


```python
s = pd.Series([1,2,7,4,5])
print(s)
```

    0    1
    1    2
    2    7
    3    4
    4    5
    dtype: int64



```python
# 自定义索引
s = pd.Series([1,2,7,4,5],index=['A','B','C','D','E'])
print(s)
```

    A    1
    B    2
    C    7
    D    4
    E    5
    dtype: int64



```python
# 定义name
s = pd.Series([1,2,7,4,5],index=['A','B','C','D','E'],name='月')
print(s)
```

    A    1
    B    2
    C    7
    D    4
    E    5
    Name: 月, dtype: int64



```python
# 通过字典创建
s = pd.Series({"a":1,"b":2,"c":3})
print(s)
s1 = pd.Series(s,index=["a","c"])
print(s1)
```

    a    1
    b    2
    c    3
    dtype: int64
    a    1
    c    3
    dtype: int64


# 属性


```python
print(s.index)
```

    Index(['a', 'b', 'c'], dtype='object')



```python
print(s.values)
```

    [1 2 3]



```python
print(s.shape,s.ndim,s.size)
```

    (3,) 1 3



```python
print(s.dtype)
```

    int64



```python
s.name = 'test'
print(s.name)
```

    test



```python
print(s.loc["a"])  # 显式索引
```

    1



```python
print(s.iloc[2]) # 隐式索引
```

    3



```python
print(s.loc["a":"c"])
```

    a    1
    b    2
    c    3
    Name: test, dtype: int64



```python
print(s.at['a']) # at不支持切片
print(s.iat[2])
```

    1
    3


# 访问数据


```python
# 直接访问
print(s['a'])
```

    1



```python
print(s[s>1]) # 布尔索引
```

    b    2
    c    3
    Name: test, dtype: int64



```python
print(s.head()) # 默认返回前五行
```

    a    1
    b    2
    c    3
    Name: test, dtype: int64



```python
print(s.tail()) # 默认后五行
print(s.head(2))
```

    a    1
    b    2
    c    3
    Name: test, dtype: int64
    a    1
    b    2
    Name: test, dtype: int64


# 常用方法


```python
s1 = pd.Series([10,2,np.nan,None,3,4,5],index=['A','B','C','D','E','F','G'],name='date')
print(s1)
```

    A    10.0
    B     2.0
    C     NaN
    D     NaN
    E     3.0
    F     4.0
    G     5.0
    Name: date, dtype: float64



```python
s1.head()
```




    A    10.0
    B     2.0
    C     NaN
    D     NaN
    E     3.0
    Name: date, dtype: float64




```python
s1.tail(2)
```




    F    4.0
    G    5.0
    Name: date, dtype: float64




```python
s1.describe() 
```




    count     5.000000
    mean      4.800000
    std       3.114482
    min       2.000000
    25%       3.000000
    50%       4.000000
    75%       5.000000
    max      10.000000
    Name: date, dtype: float64




```python
# 获取非缺失值的元素个数
print(s1.count())
```

    5



```python
# 获取索引
print(s1.keys()) # 方法
print(s1.index)  # 属性
```

    Index(['A', 'B', 'C', 'D', 'E', 'F', 'G'], dtype='object')
    Index(['A', 'B', 'C', 'D', 'E', 'F', 'G'], dtype='object')



```python
# 判断
print(s1.isna()) # 检查每个元素是否为缺失值
print(s1.isin([4,5,6])) # 检查每个元素是否在参数集合中
```

    A    False
    B    False
    C     True
    D     True
    E    False
    F    False
    G    False
    Name: date, dtype: bool
    A    False
    B    False
    C    False
    D    False
    E    False
    F     True
    G     True
    Name: date, dtype: bool



```python
print(s1.mean())
print(s1.std())
print(s1.var())
print(s1.sum())
print(s1.max())
print(s1.min())
print(s1.median()) # 缺失值都不参与运算
```

    4.8
    3.1144823004794877
    9.700000000000001
    24.0
    10.0
    2.0
    4.0



```python
s1.sort_values()
```




    B     2.0
    E     3.0
    F     4.0
    G     5.0
    A    10.0
    C     NaN
    D     NaN
    Name: date, dtype: float64




```python
print(s1.quantile(0.25))
```

    3.0



```python
# 众数
print(s1.mode())
```

    0     2.0
    1     3.0
    2     4.0
    3     5.0
    4    10.0
    Name: date, dtype: float64



```python
print(s1.value_counts()) # 每个元素的计数
```

    date
    10.0    1
    2.0     1
    3.0     1
    4.0     1
    5.0     1
    Name: count, dtype: int64



```python
# 去重
s1.drop_duplicates() # 缺失值也会被去重
```




    A    10.0
    B     2.0
    C     NaN
    E     3.0
    F     4.0
    G     5.0
    Name: date, dtype: float64




```python
s1.sort_index() # 按索引排序
```




    A    10.0
    B     2.0
    C     NaN
    D     NaN
    E     3.0
    F     4.0
    G     5.0
    Name: date, dtype: float64




```python
s1.sort_values() # 按值排序
```




    B     2.0
    E     3.0
    F     4.0
    G     5.0
    A    10.0
    C     NaN
    D     NaN
    Name: date, dtype: float64




```python
s1.diff() # 计算前后两个之间的差值
```




    A    NaN
    B   -8.0
    C    NaN
    D    NaN
    E    NaN
    F    1.0
    G    1.0
    Name: date, dtype: float64

