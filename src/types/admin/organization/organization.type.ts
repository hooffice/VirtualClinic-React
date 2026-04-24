export interface OrganizationListItem {
  id:            number;
  client_ID:     number;
  code:          string | null;
  name:          string | null;
  address_Line1: string | null;
  address_Line2: string | null;
  city_ID:       number | null;
  state_ID:      number | null;
  country_ID:    number | null;
  zip:           string | null;
  contact1:      string | null;
  contact2:      string | null;
  active:        string | null;
  company_Name:  string | null;
  state:         string | null;
  city:          string | null;
  country:       string | null;
}


export interface OrganizationModel {
  id:           number;
  clientId:     number;
  code:         string | null;
  name:         string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  cityId:       number | null;
  stateId:      number | null;
  countryId:    number | null;
  zip:          string | null;
  contact1:     string | null;
  contact2:     string | null;
  active:       boolean | null;
}

export interface ListResponse {
  data:    OrganizationListItem[];
  success: boolean;
}
