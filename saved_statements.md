                                     Table "public.saved_statements"
        Column        |            Type             | Collation | Nullable |           Default            
----------------------+-----------------------------+-----------+----------+------------------------------
 id                   | integer                     |           | not null | generated always as identity
 control_number       | integer                     |           | not null | 
 services_for_name    | character varying(120)      |           | not null | ''::character varying
 date_of_death        | date                        |           |          | 
 place_of_death       | character varying(120)      |           | not null | ''::character varying
 service_date         | date                        |           |          | 
 reason_for_embalming | character varying(255)      |           |          | 
 package_id           | integer                     |           |          | 
 sales_tax_rate       | numeric(6,4)                |           |          | 0
 payment              | numeric(10,2)               |           |          | 0
 saved_at             | timestamp without time zone |           | not null | CURRENT_TIMESTAMP
Indexes:
    "saved_statements_pkey" PRIMARY KEY, btree (id)
    "saved_statements_control_number_key" UNIQUE CONSTRAINT, btree (control_number)
Foreign-key constraints:
    "saved_statements_package_id_fkey" FOREIGN KEY (package_id) REFERENCES service_packages(id)
Referenced by:
    TABLE "saved_statement_cash_advances" CONSTRAINT "saved_statement_cash_advances_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES saved_statements(id) ON DELETE CASCADE
    TABLE "saved_statement_merchandise" CONSTRAINT "saved_statement_merchandise_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES saved_statements(id) ON DELETE CASCADE
    TABLE "saved_statement_services" CONSTRAINT "saved_statement_services_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES saved_statements(id) ON DELETE CASCADE
    TABLE "saved_statement_special_charges" CONSTRAINT "saved_statement_special_charges_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES saved_statements(id) ON DELETE CASCADE

