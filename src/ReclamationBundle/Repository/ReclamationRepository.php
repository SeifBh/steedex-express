<?php

namespace ReclamationBundle\Repository;

/**
 * ReclamationRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class ReclamationRepository extends \Doctrine\ORM\EntityRepository
{

    public function allRec(){
        return $this->createQueryBuilder('d')
            ->select('COUNT(d)')
            ->getQuery()
            ->getSingleScalarResult();
    }
    public function dixDernierReclamation()
    {
        $query = $this->getEntityManager()
            ->createQuery("SELECT d  FROM ReclamationBundle\Entity\Reclamation d ORDER BY d.id DESC")
            ->setMaxResults(8)
        ;


        // returns an array of Product objects
        return $query->getResult();
    }


    public function dixDernierReclamationUser($id)
    {
        return $this->createQueryBuilder('a')
            ->select('a')
            ->where('a.id_user = :id')
            ->setParameter('id',  $id )

            ->getQuery()->getResult();
    }


}
