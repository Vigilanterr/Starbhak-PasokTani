-- One active complaint per order. Active = open, farmer_responded or under_mediation.
-- Once a complaint is resolved or rejected the order can be complained about again.
CREATE UNIQUE INDEX complaints_one_active_per_order ON complaints (order_id)
  WHERE status IN ('open', 'farmer_responded', 'under_mediation');
