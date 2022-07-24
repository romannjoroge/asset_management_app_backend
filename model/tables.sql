CREATE SCHEMA IF NOT EXISTS Assets;
CREATE SCHEMA IF NOT EXISTS Users;

CREATE TABLE Assets.category(
    name        varchar(50),
    id          serial,    
    dep_type    varchar(50),    -- type of depreciation
    num_dep     int,    -- total number of depreciations
    freq_dep    int     -- frequency of the depreciations in months
);

CREATE TABLE Users.company(
    name    varchar(50),
    id      serial
);

CREATE TABLE Users.branch(
    id              serial,
    company_id      serial,            -- id of the company the branch belongs to
    city            varchar(50),     -- city where the branch is located in
    name            varchar(50)
);

CREATE TABLE Users.location(
    id              serial,
    branch_id       serial,
    name            varchar(50)
);

CREATE TABLE Assets.item(
    id                  serial,
    categ_id            int,        -- id of the category the item belongs to
    name                varchar(50),
    user_id             varchar(50),        -- id of the owner of an item
    purchase_date       date,
    purchase_amount     real,       -- buying price of the item
    next_dep_date       date,       -- the date of its next depreciation
    accum_dep           real,       -- the accumulated depreciation on the item
    isnew               boolean,    -- whether the item was newly purchased or its an existing item
    location_id         serial,
);