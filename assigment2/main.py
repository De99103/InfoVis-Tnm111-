import pandas as pd
import tkinter as tk
import math

data1 = pd.read_csv("data1.csv", header=None)
data1.columns = ["x", "y", "category"]
print(data1.head())

data2 = pd.read_csv("data2.csv", header=None)
data2.columns = ["x", "y", "category"]
print(data2.head())

root = tk.Tk()
root.title("Data Viewer")
canvas = tk.Canvas(root, width=800, height=600, bg="white")
canvas.pack()

points= []
grid_items = []
selected_index = None # which point is selected for moving

def draw_point(x, y, cat):
    r = 4 
    if cat == 0:
        item = canvas.create_rectangle(x-r, y-r, x+r, y+r, fill="red", outline="")
    elif cat == 1:
        item = canvas.create_oval(x-r, y-r, x+r, y+r, fill="black", outline="")
    else:
        item = canvas.create_polygon(x, y-r, x-r, y+r, x+r, y+r, fill="blue", outline="")
    return item

QUAD_COLORS = {  # colors for quadrants
    "Q1":  "grey", #(+x, +y)
    "Q2": "green", #(-x, +y)
    "Q3": "yellow", #(-x, -y)
    "Q4": "lightgreen", #(+x, -y)
    "AXIS": "black"
}

def find_clicked_point(mx, my,radius= 8):
    best = None
    best_dist = radius
    for i, p in enumerate(points):
        d = math.hypot(p["sx"] - mx, p["sy"] - my) # sx = screen x, sy = screen y
                                                   #we need the true geometric distance between the mouse click and a point
        if d < best_dist:
            best = i
            best_dist = d
    return best

def reset_view():
    global grid_items 
    for p in points:
        canvas.itemconfig(p["item"], fill=p["base_fill"], outline="", width=1)
    
    for gid in grid_items:
        canvas.delete(gid)
    grid_items = []


def apply_quadrant_view(origin_idx):
    global grid_items

    origin = points[origin_idx]
    x0, y0 = origin["x"], origin["y"]
    sx0, sy0 = origin["sx"], origin["sy"]

    # remove old grid lines
    for gid in grid_items:
        canvas.delete(gid)
    grid_items = []

    # draw new axes through selected point (this makes it the new origin)
    vline = canvas.create_line(sx0, margin, sx0, h - margin, width=2, dash=(4, 2))
    hline = canvas.create_line(margin, sy0, w - margin, sy0, width=2, dash=(4, 2))

    # label the origin as (0,0) so it's clear to the user
    label = canvas.create_text(sx0 + 10, sy0 - 10, 
                                text=f"({sx0:.2f}, {sy0:.2f})",
                                fill="purple",
                                font=("Helvetica", 10, "bold"),
                                anchor="nw")
    
    grid_items.extend([vline, hline, label])



    for i,p in enumerate(points): 
        if i == origin_idx:
            canvas.itemconfig(p["item"], fill=p["base_fill"], outline="purple", width=3)
            continue

        dx = p["x"] - x0 
        dy = p["y"] - y0

        if dx == 0 or dy == 0:
            color = QUAD_COLORS["AXIS"]
        elif dx > 0 and dy > 0:
            color = QUAD_COLORS["Q1"]
        elif dx < 0 and dy > 0:
            color = QUAD_COLORS["Q2"]
        elif dx < 0 and dy < 0:
            color = QUAD_COLORS["Q3"]
        else: #dx > 0 and dy < 0
            color = QUAD_COLORS["Q4"]

        canvas.itemconfig(p["item"], fill=color)

def on_left_click(event):

    if event.num != 1:
        return
     
    global selected_index
    
    idx = find_clicked_point(event.x, event.y)
    if idx is  None:
        return 
    
    if selected_index == idx:
        #deselect
        selected_index = None
        reset_view()
    
    else: 
        selected_index = idx
        apply_quadrant_view(idx)


def on_right_click(event):
    reset_view()

def map_x(x):
    return margin + (x - xmin) / (xmax - xmin) * range_x

def map_y(y):
    return h - margin - (y - ymin) / (ymax - ymin) * range_y


## CURRENT DATA SET ##
data = data2

margin = 50 # margins for content
h,w = 600,800 # h and w of entire GUI
xmin, xmax = data["x"].min(), data["x"].max()
ymin, ymax = data["y"].min(), data["y"].max()

#axises
canvas.create_line(margin,margin, margin, h-margin)
canvas.create_line(margin, h-margin, w-margin, h-margin)

range_x, range_y = w-2*margin, h-2*margin # width and height of drawing area

## TICKS
ticks = 5
categories = data["category"].unique()

BASE_FILLS = {0: "red", 1: "black", 2: "blue"}

for _, row in data.iterrows():
    sx = map_x(row.x)
    sy = map_y(row.y)
    cat_index = (categories == row.category).nonzero()[0][0]

    item_id = draw_point(sx, sy, cat_index)

    points.append({
        "x": float(row.x),      # data coords
        "y": float(row.y),
        "sx": float(sx),        # screen coords
        "sy": float(sy),
        "item": item_id,        # canvas item id
        "base_fill": BASE_FILLS.get(cat_index, "black")  # for resetting
    })

# x axis ticks
for i in range(ticks + 1):
    # value in data space
    val = xmin + i * (xmax - xmin) / ticks

    # position in screen space
    sx = map_x(val)
    sy = h - margin

    # tick mark
    canvas.create_line(sx, sy, sx, sy + 5)

    # label
    canvas.create_text(
        sx, sy + 15,
        text=f"{val:.2f}",
        anchor="n"
    )
    # y axis ticks
for i in range(ticks + 1):
    val = ymin + i * (ymax - ymin) / ticks

    sx = margin
    sy = map_y(val)

    # tick mark
    canvas.create_line(sx - 5, sy, sx, sy)

    # label
    canvas.create_text(
        sx - 10, sy,
        text=f"{val:.2f}",
        anchor="e"
    )



## LEGEND
txt = ""
shapes = ["square", "circle", "triangle", "star"]
for i in range(categories.size):
    txt += categories[i] + ": " + shapes[i] + "\n"

# create legend text first
legend_text = canvas.create_text(
    w - 50, 50,
    text=txt,
    anchor="ne",
    fill="black"
)

# get bounding box of the text
bbox = canvas.bbox(legend_text)
pad = 6  # padding around the text

# draw rectangle behind the text
legend_box = canvas.create_rectangle(
    bbox[0] - pad, bbox[1] - pad,
    bbox[2] + pad, bbox[3] + pad,
    outline="",
    fill="lightgray"
)

# make sure text is on top of the rectangle
canvas.tag_raise(legend_text, legend_box)


canvas.bind("<Button-1>", on_left_click)
root.mainloop()