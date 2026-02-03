import pandas as pd
import tkinter as tk

data1 = pd.read_csv("data1.csv", header=None)
data1.columns = ["x", "y", "category"]

print(data1.head())
print(data1.info())

data2 = pd.read_csv("data2.csv", header=None)
data2.columns = ["x", "y", "category"]
print(data2.head())
print(data2.info())

root = tk.Tk()
root.title("Data Viewer")
canvas = tk.Canvas(root, width=800, height=600, bg="white")
canvas.pack()

root.mainloop()