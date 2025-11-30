---
title: "Python数据分析-dataframe"
categories: Study
tags: ['Python']
id: "f6405e58f11af5c2"
date: 2025-11-30 21:45:38
cover: "https://zycs-img-2lg.pages.dev/v2/WHfvs07.jpeg"
---

# dataframe的创建


```python
import pandas as pd
import numpy as np
```


```python
# 通过series创建
s1 = pd.Series([1,2,3,4,5])
s2 = pd.Series([6,7,8,9,10])
df1 = pd.DataFrame({"第一列":s1,"第二列":s2})
print(df1)
```

       第一列  第二列
    0    1    6
    1    2    7
    2    3    8
    3    4    9
    4    5   10



```python
# 通过字典来创建
df2 = pd.DataFrame(
    {
        "id":[1,2,3,4,5],
        "name":["tom","bob","jack","alice","mark"],
        "age":[18,19,20,17,18]
    },
    index = [1,2,3,4,5],columns = ["name","age","id"]
)
print(df2)
```

        name  age  id
    1    tom   18   1
    2    bob   19   2
    3   jack   20   3
    4  alice   17   4
    5   mark   18   5


# 属性


```python
# 行索引
print(df2.index)
# 列索引
print(df2.columns)
# 值
print(df2.values)
```

    Index([1, 2, 3, 4, 5], dtype='int64')
    Index(['name', 'age', 'id'], dtype='object')
    [['tom' 18 1]
     ['bob' 19 2]
     ['jack' 20 3]
     ['alice' 17 4]
     ['mark' 18 5]]



```python
# 维度
print(df2.ndim)
# 数据类型
print(df2.dtypes)
# 形状
print(df2.shape)
# 元素个数
print(df2.size)
```

    2
    name    object
    age      int64
    id       int64
    dtype: object
    (5, 3)
    15



```python
# 行列转置
print(df2.T)
```

            1    2     3      4     5
    name  tom  bob  jack  alice  mark
    age    18   19    20     17    18
    id      1    2     3      4     5



```python
# 获取元素 loc iloc at iat
# 获取某行数据
print(df2)
print(df2.loc[4]) # 显式索引
print(df2.iloc[3]) #隐式索引
```

        name  age  id
    1    tom   18   1
    2    bob   19   2
    3   jack   20   3
    4  alice   17   4
    5   mark   18   5
    name    alice
    age        17
    id          4
    Name: 4, dtype: object
    name    alice
    age        17
    id          4
    Name: 4, dtype: object



```python
# 获取某列
print(df2.loc[:,"name"])
print(df2.iloc[:,0])
```

    1      tom
    2      bob
    3     jack
    4    alice
    5     mark
    Name: name, dtype: object
    1      tom
    2      bob
    3     jack
    4    alice
    5     mark
    Name: name, dtype: object



```python
# 单个元素
print(df2.at[3,"age"])
print(df2.iat[2,1])
```

    20
    20



```python
# 其他获取单列
print(df2["name"])
print(df2.name)
print(df2[["name","age"]]) # 获取多列
```

    1      tom
    2      bob
    3     jack
    4    alice
    5     mark
    Name: name, dtype: object
    1      tom
    2      bob
    3     jack
    4    alice
    5     mark
    Name: name, dtype: object
        name  age
    1    tom   18
    2    bob   19
    3   jack   20
    4  alice   17
    5   mark   18



```python
# 查看部分数据
print(df2.head(2))
print(df2.tail(3))
```

      name  age  id
    1  tom   18   1
    2  bob   19   2
        name  age  id
    3   jack   20   3
    4  alice   17   4
    5   mark   18   5



```python
print(df2.age>18)
```

    1    False
    2     True
    3     True
    4    False
    5    False
    Name: age, dtype: bool



```python
# 使用布尔索引筛选数据
print(df2[df2.age>18])
print(df2[(df2.age>18)&(df2.id<3)])
```

       name  age  id
    2   bob   19   2
    3  jack   20   3
      name  age  id
    2  bob   19   2



```python
# 随机抽样
df2.sample(3)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }


    .dataframe tbody tr th {
        vertical-align: top;
    }
    
    .dataframe thead th {
        text-align: right;
    }

</style>

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>age</th>
      <th>id</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>5</th>
      <td>mark</td>
      <td>18</td>
      <td>5</td>
    </tr>
    <tr>
      <th>2</th>
      <td>bob</td>
      <td>19</td>
      <td>2</td>
    </tr>
    <tr>
      <th>4</th>
      <td>alice</td>
      <td>17</td>
      <td>4</td>
    </tr>
  </tbody>
</table>

</div>



# 常用方法


```python
print(df2.head())
print(df2.tail())
```

        name  age  id
    1    tom   18   1
    2    bob   19   2
    3   jack   20   3
    4  alice   17   4
    5   mark   18   5
        name  age  id
    1    tom   18   1
    2    bob   19   2
    3   jack   20   3
    4  alice   17   4
    5   mark   18   5



```python
#  是否在集合中
print(df2.isin(["bob",20]))
```

        name    age     id
    1  False  False  False
    2   True  False  False
    3  False   True  False
    4  False  False  False
    5  False  False  False



```python
print(df2.isna()) # 是否是缺失值
```

        name    age     id
    1  False  False  False
    2  False  False  False
    3  False  False  False
    4  False  False  False
    5  False  False  False



```python
# 统计方法
print(df2.age.sum())
```

    92



```python
print(df2.age.max())
```

    20



```python
print(df2.age.mean())
```

    18.4



```python
print(df2.age.median())
```

    18.0



```python
print(df2.age.mode()) # 众数
```

    0    18
    Name: age, dtype: int64



```python
print(df2.age.std())
print(df2.age.var())
```

    1.140175425099138
    1.3



```python
print(df2.age.quantile(0.25)) # 分位数
```

    18.0



```python
print(df2.describe()) # 描述信息
```

                 age        id
    count   5.000000  5.000000
    mean   18.400000  3.000000
    std     1.140175  1.581139
    min    17.000000  1.000000
    25%    18.000000  2.000000
    50%    18.000000  3.000000
    75%    19.000000  4.000000
    max    20.000000  5.000000



```python
print(df2.count()) # 每列非缺失值元素个数
```

    name    5
    age     5
    id      5
    dtype: int64



```python
print(df2.value_counts())
```

    name   age  id
    alice  17   4     1
    bob    19   2     1
    jack   20   3     1
    mark   18   5     1
    tom    18   1     1
    Name: count, dtype: int64



```python
print(df2.drop_duplicates()) # 去重
```

        name  age  id
    1    tom   18   1
    2    bob   19   2
    3   jack   20   3
    4  alice   17   4
    5   mark   18   5



```python
print(df2.duplicated(subset=["age"])) # 检查是否重复
```

    1    False
    2    False
    3    False
    4    False
    5     True
    dtype: bool



```python
# 随机采样
df2.sample(2)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }


    .dataframe tbody tr th {
        vertical-align: top;
    }
    
    .dataframe thead th {
        text-align: right;
    }

</style>

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>age</th>
      <th>id</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>3</th>
      <td>jack</td>
      <td>20</td>
      <td>3</td>
    </tr>
    <tr>
      <th>1</th>
      <td>tom</td>
      <td>18</td>
      <td>1</td>
    </tr>
  </tbody>
</table>

</div>




```python
print(df2.replace(18,30)) # 18改为30
```

        name  age  id
    1    tom   30   1
    2    bob   19   2
    3   jack   20   3
    4  alice   17   4
    5   mark   30   5



```python
# 累计和
df2.cumsum()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }


    .dataframe tbody tr th {
        vertical-align: top;
    }
    
    .dataframe thead th {
        text-align: right;
    }

</style>

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>age</th>
      <th>id</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>tom</td>
      <td>18</td>
      <td>1</td>
    </tr>
    <tr>
      <th>2</th>
      <td>tombob</td>
      <td>37</td>
      <td>3</td>
    </tr>
    <tr>
      <th>3</th>
      <td>tombobjack</td>
      <td>57</td>
      <td>6</td>
    </tr>
    <tr>
      <th>4</th>
      <td>tombobjackalice</td>
      <td>74</td>
      <td>10</td>
    </tr>
    <tr>
      <th>5</th>
      <td>tombobjackalicemark</td>
      <td>92</td>
      <td>15</td>
    </tr>
  </tbody>
</table>

</div>




```python
# 累计最小
df2.cummin()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }


    .dataframe tbody tr th {
        vertical-align: top;
    }
    
    .dataframe thead th {
        text-align: right;
    }

</style>

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>age</th>
      <th>id</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>tom</td>
      <td>18</td>
      <td>1</td>
    </tr>
    <tr>
      <th>2</th>
      <td>bob</td>
      <td>18</td>
      <td>1</td>
    </tr>
    <tr>
      <th>3</th>
      <td>bob</td>
      <td>18</td>
      <td>1</td>
    </tr>
    <tr>
      <th>4</th>
      <td>alice</td>
      <td>17</td>
      <td>1</td>
    </tr>
    <tr>
      <th>5</th>
      <td>alice</td>
      <td>17</td>
      <td>1</td>
    </tr>
  </tbody>
</table>

</div>




```python
# 按索引排序
print(df2.sort_index(ascending=False)) # 降序
```

        name  age  id
    5   mark   18   5
    4  alice   17   4
    3   jack   20   3
    2    bob   19   2
    1    tom   18   1



```python
print(df2.sort_values(by=["age","id"],ascending=[True,False]))
```

        name  age  id
    4  alice   17   4
    5   mark   18   5
    1    tom   18   1
    2    bob   19   2
    3   jack   20   3



```python
df2.nlargest(2,columns=['age','id'])
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }


    .dataframe tbody tr th {
        vertical-align: top;
    }
    
    .dataframe thead th {
        text-align: right;
    }

</style>

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>age</th>
      <th>id</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>3</th>
      <td>jack</td>
      <td>20</td>
      <td>3</td>
    </tr>
    <tr>
      <th>2</th>
      <td>bob</td>
      <td>19</td>
      <td>2</td>
    </tr>
  </tbody>
</table>

</div>




```python
df2.nsmallest(2,columns=['age','id'])
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }


    .dataframe tbody tr th {
        vertical-align: top;
    }
    
    .dataframe thead th {
        text-align: right;
    }

</style>

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>age</th>
      <th>id</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>4</th>
      <td>alice</td>
      <td>17</td>
      <td>4</td>
    </tr>
    <tr>
      <th>1</th>
      <td>tom</td>
      <td>18</td>
      <td>1</td>
    </tr>
  </tbody>
</table>

</div>

