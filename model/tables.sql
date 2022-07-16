CREATE TABLE category(
    name        varchar(20),
    id          int,    
    dep_type    varchar(20),    -- type of depreciation
    num_dep     int,    -- total number of depreciations
    freq_dep    int     -- frequency of the depreciations in months
);

CREATE TABLE item(
    id                  int,
    categ_id            int,        -- id of the category the item belongs to
    name                varchar(30),
    purchase_date       date,
    purchase_amount     real,       -- buying price of the item
    next_dep_date       date,       -- the date of its next depreciation
    accum_dep           real,       -- the accumulated depreciation on the item
    isnew               boolean,    -- whether the item was newly purchased or its an existing item
    location_id         int,
);

CREATE TABLE company(
    name    varchar(30),
    id      int
);

CREATE TABLE branch(
    id              int,
    company_id      int,            -- id of the company the branch belongs to
    city            varchar(30),     -- city where the branch is located in
    name            varchar(30)
);

CREATE TABLE location(
    id              int,
    branch_id       int,
    name            varchar(30)
);

CREATE TABLE location_item(
    location_id     int,
    item_id         int,
);