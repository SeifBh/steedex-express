<?php

namespace DemandeBundle\Repository;

/**
 * DemandeRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class DemandeRepository extends \Doctrine\ORM\EntityRepository
{

    public function countUnreadCol(){
        return $this->createQueryBuilder('d')
            ->select('COUNT(d)')
            ->where('d.readDemande = false')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function allDemandes(){
        return $this->createQueryBuilder('d')
            ->select('COUNT(d)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function valide(){
        return $this->createQueryBuilder('d')
            ->select('COUNT(d)')
            ->where('d.etat = ?1')
            ->setParameter(1, 'Valide')
            ->getQuery()
            ->getSingleScalarResult();
    }


    public function enCours(){
        return $this->createQueryBuilder('d')
            ->select('COUNT(d)')
            ->where('d.etat = ?1')
            ->setParameter(1, 'Encours')
            ->getQuery()
            ->getSingleScalarResult();
    }




    public function enTraitement(){
        return $this->createQueryBuilder('d')
            ->select('COUNT(d)')
            ->where('d.etat = ?1')
            ->setParameter(1, 'EnTraitement')
            ->getQuery()
            ->getSingleScalarResult();
        $query =$this->getEntityManager()
            ->createQuery("SELECT l FROM Geo\Entity\Location WHERE l.address = '1600 Amphitheatre Parkway, Mountain View, CA'");


    }

    public function dixDernierDemande()
    {
        $query = $this->getEntityManager()
            ->createQuery("SELECT d  FROM DemandeBundle\Entity\Demande d  ORDER BY d.id DESC")
            ->setMaxResults(10)
        ;


        // returns an array of Product objects
        return $query->getResult();
    }

    public function dixDernierDemandeUser($id)
    {
        return $this->createQueryBuilder('a')
            ->select('a')
            ->where('a.id_client = :id')
            ->setParameter('id',  $id )

            ->getQuery();
    }



    public function getLivreurDemandes($id)
    {


        return $this->createQueryBuilder('d')
            ->where('d.id_livreur =  :id')
            ->setParameter('id',  $id )
            ->getQuery()
            ->getResult();


    }







    public function filterByClients($id){
        return $this->createQueryBuilder('d')
            ->where('d.id_client =  :id')
            ->andWhere('d.archive =  false')
            ->setParameter('id',  $id )
            ->orderBy('d.id', 'DESC')

            ->getQuery()
            ->getResult();
    }

    public function filterByClientsDate($date){
        return $this->createQueryBuilder('d')
            ->where("d.date_emission")
            ->where( "DATE_FORMAT(d.date_emission, '%Y-%m-%d') = :date" )
            ->andWhere('d.archive =  false')
            ->setParameter('date',  $date )
            ->orderBy('d.id', 'DESC')
            ->getQuery()
            ->getResult();
    }



    public function filterGlobal($id,$date){
        return $this->createQueryBuilder('d')
            ->where('d.id_client =  :id')
            ->andWhere('d.archive =  false')
            ->andWhere( "DATE_FORMAT(d.date_emission, '%Y-%m-%d') = :date" )
            ->setParameter('date',  $date )
            ->setParameter('id',  $id )
            ->orderBy('d.id', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function filterGlobalLivreur($id,$date){
        return $this->createQueryBuilder('d')
            ->where('d.id_livreur =  :id')
            ->andWhere('d.archive =  false')
            ->andWhere( "DATE_FORMAT(d.date_emission, '%Y-%m-%d') = :date" )
            ->setParameter('date',  $date )
            ->setParameter('id',  $id )
            ->orderBy('d.id', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function filterGlobalLivreurAll($id){
        return $this->createQueryBuilder('d')
            ->where('d.id_livreur =  :id')
            ->andWhere('d.archive =  false')
            ->setParameter('id',  $id )
            ->orderBy('d.id', 'DESC')
            ->getQuery()
            ->getResult();
    }













}
