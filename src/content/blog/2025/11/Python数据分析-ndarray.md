---
title: "Python数据分析-ndarray"
categories: Study
tags: ['Python']
id: "cfe6db1ee4e1b990"
date: 2025-11-30 21:44:51
cover: "https://zycs-img-2lg.pages.dev/v2/4wRRp7Z.jpeg"
---

# 1.ndarray的特性

## 多维性


```python
import numpy as np
```


```python
arr = np.array(5)
print(arr)
print("array的维度",arr.ndim)
```

    5
    array的维度 0



```python
arr2 = np.array([1,2,3])
print(arr2)
print("arrar的维度",arr2.ndim)
```

    [1 2 3]
    arrar的维度 1



```python
arr2 = np.array([[1,2,3],[4,5,6]])
print(arr2)
print("arrar的维度",arr2.ndim)
```

    [[1 2 3]
     [4 5 6]]
    arrar的维度 2


## 同质性


```python
arr3 = np.array([1,"hello"])
print(arr3)
```

    ['1' 'hello']


不同的数据类型会被转化成相同的数据类型


```python
arr4 = np.array([1,2.5])
print(arr4)
```

    [1.  2.5]


# 2.ndarray的属性


```python
arr4 = np.array(1)
print(arr4)
print("数组的形状:",arr4.shape)
print("数组的维度:",arr4.ndim)
print("元素的个数:",arr4.size)
print("元素的数据类型:",arr4.dtype)
print("元素的转置:",arr4.T)
```

    1
    数组的形状: ()
    数组的维度: 0
    元素的个数: 1
    元素的数据类型: int32
    元素的转置: 1



```python
arr5 = np.array([1,2,3])
print(arr5)
print("数组的形状:",arr5.shape)
print("数组的维度:",arr5.ndim)
print("元素的个数:",arr5.size)
print("元素的数据类型:",arr5.dtype)
print("元素的转置:",arr5.T)
```

    [1 2 3]
    数组的形状: (3,)
    数组的维度: 1
    元素的个数: 3
    元素的数据类型: int32
    元素的转置: [1 2 3]



```python
arr6 = np.array([[1,2,3],[4,5.0,6]])
print(arr6)
print("数组的形状:",arr6.shape)
print("数组的维度:",arr6.ndim)
print("元素的个数:",arr6.size)
print("元素的数据类型:",arr6.dtype)
print("元素的转置:",arr6.T)
```

    [[1. 2. 3.]
     [4. 5. 6.]]
    数组的形状: (2, 3)
    数组的维度: 2
    元素的个数: 6
    元素的数据类型: float64
    元素的转置: [[1. 4.]
     [2. 5.]
     [3. 6.]]


# 3.ndarray的创建

## 基础的创建方法


```python
arr7 = np.array([1,2,3],dtype=np.float32)
print(arr7)
arr7
```

    [1. 2. 3.]





    array([1., 2., 3.], dtype=float32)



## copy


```python
arr8 = np.copy(arr7) # 元素跟原始的数组相同，但是不是一个数组了
arr8
```




    array([1., 2., 3.], dtype=float32)



## 预定义形状


```python
# 全0
arr9 = np.zeros((2,3)) 
print(arr9)
print(arr9.dtype) # 默认float64
```

    [[0. 0. 0.]
     [0. 0. 0.]]
    float64



```python
# 全1
arr10 = np.ones((3,4))
print(arr10)
```

    [[1. 1. 1. 1.]
     [1. 1. 1. 1.]
     [1. 1. 1. 1.]]



```python
# 未初始化
arr11 = np.empty((3,5)) # 内容是随机的
print(arr11)
```

    [[0.00000000e+000 0.00000000e+000 0.00000000e+000 0.00000000e+000
      0.00000000e+000]
     [0.00000000e+000 0.00000000e+000 0.00000000e+000 0.00000000e+000
      0.00000000e+000]
     [0.00000000e+000 0.00000000e+000 0.00000000e+000 0.00000000e+000
      2.59305626e-306]]



```python
# 任意数填充
arr12 = np.full((3,4),78)
arr12
```




    array([[78, 78, 78, 78],
           [78, 78, 78, 78],
           [78, 78, 78, 78]])




```python
arr13 = np.zeros_like(arr12)
print(arr13)
arr14 = np.empty_like(arr10)
print(arr14)
```

    [[0 0 0 0]
     [0 0 0 0]
     [0 0 0 0]]
    [[1. 1. 1. 1.]
     [1. 1. 1. 1.]
     [1. 1. 1. 1.]]


## 特殊数列


```python
# 等差数列
arr15 = np.arange(2,11,2) # start,end,step
print(arr15)
```

    [ 2  4  6  8 10]



```python
# 等间隔数列
arr16 = np.linspace(1,10,5) # start end number
print(arr16)
```

    [ 1.    3.25  5.5   7.75 10.  ]



```python
# 对数间隔数列
arr17 = np.logspace(0,4,3,base=3)
print(arr17)
```

    [ 1.  9. 81.]


## 特殊矩阵


```python
# 单位矩阵:
arr18 = np.eye(3,dtype=int)
print(arr18)
```

    [[1 0 0]
     [0 1 0]
     [0 0 1]]



```python
# 对角矩阵
arr19 = np.diag([1,2,5,3])
print(arr19)
```

    [[1 0 0 0]
     [0 2 0 0]
     [0 0 5 0]
     [0 0 0 3]]



```python
# 随机矩阵
# 生成0到1之间的随机浮点数（均匀分布）
arr20 = np.random.rand(2,3)
print(arr20)
```

    [[0.71912505 0.4289779  0.28617504]
     [0.15021712 0.21373923 0.11392345]]



```python
# 生成指定范围区间的随机浮点数
arr21 = np.random.uniform(3,6,(2,3))
print(arr21)
```

    [[3.80064859 3.98720526 3.46284681]
     [3.45723353 3.67728475 4.88173559]]



```python
# 生成指定范围区间的随机整数
arr22 = np.random.randint(3,6,(2,3))
print(arr22)
```

    [[3 4 4]
     [5 4 4]]



```python
# 生成随机数列（正态分布）
arr23 = np.random.randn(2,3)
print(arr23)
```

    [[-0.15306313  1.19935259  0.84587337]
     [ 0.54632939 -0.15679205 -1.3430744 ]]



```python
# 设置随机种子
np.random.seed(200)
arr24 = np.random.randint(1,10,(2,5))
print(arr24)
```

    [[1 5 8 7 9]
     [2 8 4 2 8]]


# 4.ndarray的数据类型


```python
# 布尔类型
arr25 = np.array([0,1,3,0],dtype='bool')
print(arr25)
```

    [False  True  True False]



```python
# 整数类型
arr26 = np.array([0,1,2,0],dtype=np.int8)
print(arr26)
```

    [0 1 2 0]



```python
# 浮点数类型float
# 复数类型complex
```

# 5.索引与切片


```python
# 一维数组的索引与切片
arr27 = np.random.randint(1,100,10)
print(arr27)
print(arr27[7])
print(arr27[:]) # 获取全部数据
print(arr27[2:5]) # 左包右不包
print(arr27[(arr27>10) & (arr27<70)]) # 取出大于10小于70的元素
print(arr27[slice(2,8,2)]) # start end step
```

    [85 34 22 13 43 46 16 56 51 97]
    56
    [85 34 22 13 43 46 16 56 51 97]
    [22 13 43]
    [34 22 13 43 46 16 56 51]
    [22 43 16]



```python
# 二维数组的索引与切片
arr28 = np.random.randint(1,100,(4,8))
print(arr28)
print(arr28[1,3])
print(arr28[:,:])
print(arr28[1,2:5])
print(arr28[arr28>50]) # 返回1维数组
print(arr28[1,:][arr28[1,:]>50]) # 取第二行大于50的元素
```

    [[17 48 13 49 86 19 59 68]
     [20 97 51 27 92 18 38 50]
     [77 19 37 50 49 18 17 96]
     [83 45 65 74 62 39 32 80]]
    27
    [[17 48 13 49 86 19 59 68]
     [20 97 51 27 92 18 38 50]
     [77 19 37 50 49 18 17 96]
     [83 45 65 74 62 39 32 80]]
    [51 27 92]
    [86 59 68 97 51 92 77 96 83 65 74 62 80]
    [97 51 92]


# 6.ndarray的运算


```python
# 算数运算
a = np.array([[1,2,3],[7,8,9]])
b = np.array([[4,5,6],[3,6,7]])
print(a+b)
print(a-b)
print(a*b)  # 对应位置元素相乘
print(a/b)  # 对应位置元素相除
print(a**2)
```

    [[ 5  7  9]
     [10 14 16]]
    [[-3 -3 -3]
     [ 4  2  2]]
    [[ 4 10 18]
     [21 48 63]]
    [[0.25       0.4        0.5       ]
     [2.33333333 1.33333333 1.28571429]]
    [[ 1  4  9]
     [49 64 81]]



```python
# 广播机制
print(a+3)
c = np.array([1,2,3])
print(a+c) 
```

    [[ 4  5  6]
     [10 11 12]]
    [[ 2  4  6]
     [ 8 10 12]]



```python
# 矩阵运算
d = np.array([2,3,4])
e = np.diag([1,2,4])
print(d)
print(e)
print(d@e) # ‘@’表示矩阵乘法
```

    [2 3 4]
    [[1 0 0]
     [0 2 0]
     [0 0 4]]
    [ 2  6 16]

